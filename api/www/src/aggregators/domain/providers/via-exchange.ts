import { AggregatorRequest } from '../aggregator-request';
import { Via } from '@viaprotocol/router-sdk';
import { Route } from '../../../shared/domain/route';
import { AggregatorProviders } from './aggregator-providers';
import { RouteResume } from '../../../shared/domain/route-resume';
import { InsufficientLiquidity } from '../../../swaps/domain/insufficient-liquidity';
import { BigInteger } from '../../../shared/domain/big-integer';
import { RouteStep } from '../../../shared/domain/route-step';
import { IActionStep, IRouteAction } from '@viaprotocol/router-sdk/dist/types';
import { Token } from '../../../shared/domain/token';
import { ProviderDetails } from '../../../shared/domain/provider-details';
import { TwoSteppedAggregator } from '../two-stepped-aggregator';
import { TransactionDetails } from '../../../shared/domain/transaction-details';
import { ApprovalTransactionDetails } from '../approval-transaction-details';
import { AggregatorDetails } from '../../../shared/domain/aggregator-details';

export class ViaExchange implements TwoSteppedAggregator {
  private enabledChains = [];
  private client: Via;

  public static create(apiKey: string): ViaExchange {
    const client = new Via({
      apiKey: apiKey,
      url: 'https://router-api.via.exchange',
      timeout: 30000,
    });

    return new ViaExchange(client);
  }

  constructor(client: Via) {
    this.client = client;
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

    const resume = new RouteResume(
      request.fromChain,
      request.toChain,
      request.fromToken,
      request.toToken,
      request.amountIn,
      BigInteger.fromString(route.toTokenAmount.toString()),
      BigInteger.fromString(route.toTokenAmount.toString()),
    );

    const steps = this.buildSteps(route.actions);
    const aggregatorDetails = new AggregatorDetails(
      AggregatorProviders.Via,
      route.routeId,
      true,
      false,
      route.actions[0].uuid,
    );

    return new Route(aggregatorDetails, resume, steps);
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
   * Builds the whole set of steps
   * @param actions
   * @private
   */
  private buildSteps(actions: IRouteAction[]): RouteStep[] {
    const items: RouteStep[] = [];
    for (const action of actions) {
      for (const step of action.steps) {
        items.push(this.buildStep(step));
      }
    }
    return items;
  }

  /**
   * Builds a single step
   * @param step
   * @private
   */
  private buildStep(step: IActionStep): RouteStep {
    const fromToken = new Token(
      step.fromToken.name,
      step.fromToken.address,
      step.fromToken.decimals,
      step.fromToken.symbol,
    );
    const toToken = new Token(
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

    return new RouteStep(type, details, fromToken, toToken, amountIn, amountOut, '');
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
