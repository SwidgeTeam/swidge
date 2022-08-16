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
import { SteppedAggregator } from '../stepped-aggregator';
import { TransactionDetails } from '../../../shared/domain/transaction-details';
import { ApprovalTransactionDetails } from '../approval-transaction-details';

export class ViaExchange implements SteppedAggregator {
  private enabledChains: string[];
  private client: Via;

  constructor() {
    this.enabledChains = [];
    const DEFAULT_API_KEY = 'e3db93a3-ae1c-41e5-8229-b8c1ecef5583';
    this.client = new Via({
      apiKey: DEFAULT_API_KEY,
      url: 'https://router-api.via.exchange',
      timeout: 30000,
    });
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
      fromTokenAddress: request.fromToken.address,
      fromAmount: Math.pow(10, 18),
      toChainId: Number(request.toChain),
      toTokenAddress: request.toToken.address,
      fromAddress: request.senderAddress,
      toAddress: request.receiverAddress,
      multiTx: false, // whether to return routes with multiple user transactions
      offset: 0,
      limit: 1,
    });

    if (!response || response.routes.length === 0) {
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
      route.routeId,
      true,
    );

    const steps = this.buildSteps(route.actions);

    return new Route(AggregatorProviders.Via, resume, null, steps);
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
}
