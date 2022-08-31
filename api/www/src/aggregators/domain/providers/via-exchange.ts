import { AggregatorRequest } from '../aggregator-request';
import { Via } from '@viaprotocol/router-sdk';
import { Route } from '../../../shared/domain/route/route';
import { AggregatorProviders } from './aggregator-providers';
import { RouteResume } from '../../../shared/domain/route/route-resume';
import { InsufficientLiquidity } from '../../../swaps/domain/insufficient-liquidity';
import { BigInteger } from '../../../shared/domain/big-integer';
import { RouteStep } from '../../../shared/domain/route/route-step';
import { IActionStep, IRouteAction } from '@viaprotocol/router-sdk/dist/types';
import { Token } from '../../../shared/domain/token';
import { ProviderDetails } from '../../../shared/domain/provider-details';
import { TransactionDetails } from '../../../shared/domain/route/transaction-details';
import { ApprovalTransactionDetails } from '../../../shared/domain/route/approval-transaction-details';
import { AggregatorDetails } from '../../../shared/domain/aggregator-details';
import { Aggregator, ExternalAggregator, TwoSteppedAggregator } from '../aggregator';
import {
  ExternalTransactionStatus,
  StatusCheckRequest,
  StatusCheckResponse,
} from '../status-check';
import { RouteFees } from '../../../shared/domain/route/route-fees';
import { PriceFeed } from '../../../shared/domain/price-feed';
import { IPriceFeedFetcher } from '../../../shared/domain/price-feed-fetcher';
import { IGasPriceFetcher } from '../../../shared/domain/gas-price-fetcher';
import { RouteSteps } from '../../../shared/domain/route/route-steps';

export class ViaExchange implements Aggregator, TwoSteppedAggregator, ExternalAggregator {
  private enabledChains = [];
  private client: Via;
  private gasPriceFetcher: IGasPriceFetcher;
  private priceFeedFetcher: IPriceFeedFetcher;

  public static create(
    apiKey: string,
    gasPriceFetcher: IGasPriceFetcher,
    priceFeedFetcher: IPriceFeedFetcher,
  ): ViaExchange {
    const client = new Via({
      apiKey: apiKey,
      url: 'https://router-api.via.exchange',
      timeout: 30000,
    });

    return new ViaExchange(client, gasPriceFetcher, priceFeedFetcher);
  }

  constructor(client: Via, gasPriceFetcher: IGasPriceFetcher, priceFeedFetcher: IPriceFeedFetcher) {
    this.client = client;
    this.gasPriceFetcher = gasPriceFetcher;
    this.priceFeedFetcher = priceFeedFetcher;
  }

  isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return this.enabledChains.includes(fromChainId) && this.enabledChains.includes(toChainId);
  }

  /**
   * Entrypoint to quote a Route from Via.exchange
   * @param request
   */
  async execute(request: AggregatorRequest) {
    const response = await this.client.getRoutes({
      fromChainId: Number(request.fromChain),
      fromTokenAddress: this.getTokenAddress(request.fromToken),
      fromAmount: Number(request.amountIn.toString()),
      toChainId: Number(request.toChain),
      toTokenAddress: this.getTokenAddress(request.toToken),
      fromAddress: request.senderAddress,
      toAddress: request.receiverAddress,
      multiTx: false, // whether to return routes with multiple user transactions
      offset: 0,
      limit: 1,
    });

    if (!response || response.routes.length === 0 || response.routes[0].actions.length === 0) {
      throw new InsufficientLiquidity();
    }

    const route = response.routes[0];
    const action = route.actions[0];

    const gasPrice = await this.gasPriceFetcher.fetch(request.fromChain);
    const nativePrice = await this.priceFeedFetcher.fetch(request.fromChain);
    const fees = this.buildFees(action, gasPrice, nativePrice);
    const steps = this.buildSteps(route.actions);

    const resume = new RouteResume(
      request.fromChain,
      request.toChain,
      request.fromToken,
      request.toToken,
      request.amountIn,
      BigInteger.fromString(route.toTokenAmount.toString()),
      BigInteger.fromString(route.toTokenAmount.toString()),
      steps.totalExecutionTime(),
    );

    const aggregatorDetails = new AggregatorDetails(
      AggregatorProviders.Via,
      route.routeId,
      true,
      false,
      action.uuid,
    );

    return new Route(aggregatorDetails, resume, steps, fees);
  }

  /**
   * Builds the required transaction to approve the assets
   * @param routeId
   * @param senderAddress
   */
  public async buildApprovalTx(
    routeId: string,
    senderAddress: string,
  ): Promise<ApprovalTransactionDetails> {
    const txApproval = await this.client.buildApprovalTx({
      routeId: routeId,
      owner: senderAddress,
      numAction: 0,
    });

    return new ApprovalTransactionDetails(txApproval.to, txApproval.data);
  }

  /**
   * Builds the transaction for the aggregator
   * @param routeId
   * @param senderAddress
   * @param receiverAddress
   */
  public async buildTx(
    routeId: string,
    senderAddress: string,
    receiverAddress: string,
  ): Promise<TransactionDetails> {
    const tx = await this.client.buildTx({
      routeId: routeId,
      fromAddress: senderAddress,
      receiveAddress: receiverAddress,
      numAction: 0,
    });

    return new TransactionDetails(
      tx.to,
      tx.data,
      BigInteger.fromString(tx.value.toString()),
      BigInteger.fromString(tx.gas.toString()),
    );
  }

  /**
   * Checks and returns the current status of the transaction
   * @param request
   */
  async checkStatus(request: StatusCheckRequest): Promise<StatusCheckResponse> {
    const statusResponse = await this.client.checkTx({
      actionUuid: request.trackingId,
    });

    let status: ExternalTransactionStatus;
    switch (statusResponse.event) {
      case 'success':
        status = ExternalTransactionStatus.Success;
        break;
      case 'pending':
      case 'to_be_started':
        status = ExternalTransactionStatus.Pending;
        break;
      case 'null':
      case 'recieve_tx_not_found':
      case 'user_tx_failed':
        status = ExternalTransactionStatus.Failed;
        break;
    }

    return {
      status: status,
    };
  }

  /**
   * Sets the transaction as executed
   * @param txHash
   * @param trackingId
   * @param fromAddress
   * @param toAddress
   */
  async executedTransaction(
    txHash: string,
    trackingId: string,
    fromAddress: string,
    toAddress: string,
  ): Promise<void> {
    await this.client.startRoute({
      fromAddress: fromAddress,
      toAddress: toAddress,
      txHash: txHash,
      routeId: trackingId,
    });
    return;
  }

  /**
   * Computes the action fees
   * @param action
   * @param gasPrice
   * @param nativePrice
   * @private
   */
  private buildFees(action: IRouteAction, gasPrice: BigInteger, nativePrice: PriceFeed): RouteFees {
    // base action fee
    const actionGasLimit = BigInteger.fromString(action.fee.gasActionUnits.toString());
    // possible additional fee form provider
    const actionAdditionalFee = action.additionalProviderFee
      ? BigInteger.fromString(action.additionalProviderFee.amount.toString())
      : BigInteger.zero();
    // compute cost of action in Wei
    const baseFee = actionGasLimit.times(gasPrice);
    // add the provider fee
    const totalFees = baseFee.plus(actionAdditionalFee);
    // convert to USD
    const feesInUsd = totalFees
      .times(nativePrice.lastPrice)
      .div(BigInteger.weiInEther())
      .toDecimal(nativePrice.decimals);

    return new RouteFees(totalFees, feesInUsd);
  }

  /**
   * Builds the whole set of steps
   * @param actions
   * @private
   */
  private buildSteps(actions: IRouteAction[]): RouteSteps {
    const items: RouteStep[] = [];
    for (const action of actions) {
      for (const step of action.steps) {
        items.push(this.buildStep(step));
      }
    }
    return new RouteSteps(items);
  }

  /**
   * Builds a single step
   * @param step
   * @private
   */
  private buildStep(step: IActionStep): RouteStep {
    const fromToken = new Token(
      step.fromToken.chainId.toString(),
      step.fromToken.name,
      step.fromToken.address,
      step.fromToken.decimals,
      step.fromToken.symbol,
    );
    const toToken = new Token(
      step.toToken.chainId.toString(),
      step.toToken.name,
      step.toToken.address,
      step.toToken.decimals,
      step.toToken.symbol,
    );
    const details = new ProviderDetails(step.tool.name, step.tool.logoURI);
    const amountIn = BigInteger.fromString(step.fromTokenAmount.toString());
    const amountOut = BigInteger.fromString(step.toTokenAmount.toString());
    //const feeInUSD = step.gasFees.feesInUsd.toString();

    let type;
    switch (step.type) {
      case 'swap':
        type = RouteStep.TYPE_SWAP;
        break;
      case 'cross':
        type = RouteStep.TYPE_BRIDGE;
        break;
    }

    return new RouteStep(
      type,
      details,
      fromToken,
      toToken,
      amountIn,
      amountOut,
      '',
      step.tool.estimatedTime,
    );
  }

  /**
   * Returns the correct address for Via
   * @param token
   * @private
   */
  private getTokenAddress(token: Token): string {
    if (token.isNative()) {
      return '0x0000000000000000000000000000000000000000';
    }

    return token.address;
  }
}
