import { Aggregator, ExternalAggregator, MetadataProviderAggregator } from '../aggregator';
import { AggregatorRequest } from '../aggregator-request';
import LIFI, { Estimate, GasCost, Step, Token as LifiToken } from '@lifi/sdk';
import { BigInteger } from '../../../shared/domain/big-integer';
import { TransactionDetails } from '../../../shared/domain/route/transaction-details';
import { Route } from '../../../shared/domain/route/route';
import { RouteStep } from '../../../shared/domain/route/route-step';
import { Token } from '../../../shared/domain/token';
import { InsufficientLiquidity } from '../../../swaps/domain/insufficient-liquidity';
import { ProviderDetails } from '../../../shared/domain/provider-details';
import { RouteResume } from '../../../shared/domain/route/route-resume';
import { AggregatorProviders } from './aggregator-providers';
import { AggregatorDetails } from '../../../shared/domain/aggregator-details';
import { ApprovalTransactionDetails } from '../../../shared/domain/route/approval-transaction-details';
import { RouterCallEncoder } from '../../../shared/domain/router-call-encoder';
import { RouteFees } from '../../../shared/domain/route/route-fees';
import { RouteSteps } from '../../../shared/domain/route/route-steps';
import {
  ExternalTransactionStatus,
  StatusCheckRequest,
  StatusCheckResponse,
} from '../status-check';
import { flatten } from '@nestjs/common';
import { AggregatorMetadata } from '../../../shared/domain/metadata';
import { ethers } from 'ethers';
import { NATIVE_TOKEN_ADDRESS } from '../../../shared/enums/Natives';
import {
  Arbitrum,
  Avalanche,
  Boba,
  BSC,
  Celo,
  Cronos,
  Fantom,
  Huobi,
  Mainnet,
  Moonriver,
  OKT,
  Optimism,
  Polygon,
  xDAI,
} from '../../../shared/enums/ChainIds';

export class LiFi implements Aggregator, ExternalAggregator, MetadataProviderAggregator {
  private enabledChains = [
    Mainnet,
    Optimism,
    Cronos,
    BSC,
    OKT,
    xDAI,
    Huobi,
    Polygon,
    Fantom,
    Boba,
    Moonriver,
    Arbitrum,
    Avalanche,
    Celo,
  ];
  private client: LIFI;
  private routerCallEncoder: RouterCallEncoder;

  public static create() {
    return new LiFi(new LIFI());
  }

  constructor(client: LIFI) {
    this.client = client;
    this.routerCallEncoder = new RouterCallEncoder();
  }

  isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return this.enabledChains.includes(fromChainId) && this.enabledChains.includes(toChainId);
  }

  public async getMetadata(): Promise<AggregatorMetadata> {
    const chains = await this.client.getChains();
    const tokens = await this.client.getTokens();

    return {
      chains: chains.map((chain) => {
        return {
          type: chain.chainType,
          id: chain.id.toString(),
          name: chain.name,
          logo: chain.logoURI,
          coin: chain.coin,
          decimals: chain.metamask.nativeCurrency.decimals,
          rpcUrls: chain.metamask.rpcUrls,
        };
      }),
      tokens: flatten(Object.values(tokens.tokens)).map((token) => {
        return {
          chainId: token.chainId.toString(),
          address: this.getAddress(token.address),
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          logo: token.logoURI,
          price: token.priceUSD,
        };
      }),
    };
  }

  private getAddress(address: string): string {
    return address === ethers.constants.AddressZero ? NATIVE_TOKEN_ADDRESS : address;
  }

  /**
   * Entrypoint to quote a Route from Li.fi
   * @param request
   */
  async execute(request: AggregatorRequest): Promise<Route> {
    let response;
    try {
      response = await this.client.getQuote({
        fromChain: request.fromChain,
        fromToken: request.fromToken.address,
        toChain: request.toChain,
        toToken: request.toToken.address,
        fromAmount: request.amountIn.toString(),
        fromAddress: request.senderAddress,
        slippage: request.slippage / 100,
      });
    } catch (e) {
      throw new InsufficientLiquidity();
    }

    if (!response.estimate || !response.action) {
      throw new InsufficientLiquidity();
    }

    const approvalTransaction = request.fromToken.isNative()
      ? null
      : new ApprovalTransactionDetails(
          request.fromToken.address,
          this.routerCallEncoder.encodeApproval(
            response.estimate.approvalAddress,
            request.amountIn,
          ),
        );

    const transactionDetails = new TransactionDetails(
      response.transactionRequest.to,
      response.transactionRequest.data.toString(),
      BigInteger.fromString(response.transactionRequest.value.toString()),
      BigInteger.fromString(response.transactionRequest.gasLimit.toString()),
    );

    const steps = this.createSteps(response);
    const fees = this.buildFees(response.estimate);

    const resume = new RouteResume(
      request.fromChain,
      request.toChain,
      request.fromToken,
      request.toToken,
      request.amountIn,
      BigInteger.fromString(response.estimate.toAmount),
      BigInteger.fromString(response.estimate.toAmountMin),
      steps.totalExecutionTime(),
    );

    const aggregatorDetails = new AggregatorDetails(AggregatorProviders.LiFi);

    return new Route(
      aggregatorDetails,
      resume,
      steps,
      fees,
      approvalTransaction,
      transactionDetails,
    );
  }

  /**
   * @param txHash
   * @param trackingId
   * @param fromAddress
   * @param toAddress
   */
  executedTransaction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    txHash: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    trackingId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toAddress: string,
  ): Promise<void> {
    // pass
    // this provider doesn't need to be informed on executed transaction
    return;
  }

  /**
   *
   * @param request
   */
  async checkStatus(request: StatusCheckRequest): Promise<StatusCheckResponse> {
    const response = await this.client.getStatus({
      txHash: request.txHash,
      fromChain: request.fromChain,
      toChain: request.toChain,
      bridge: request.trackingId,
    });
    let status;
    switch (response.status) {
      case 'FAILED':
        status = ExternalTransactionStatus.Failed;
        break;
      case 'DONE':
        status = ExternalTransactionStatus.Success;
        break;
      case 'PENDING':
      case 'NOT_FOUND':
        status = ExternalTransactionStatus.Pending;
        break;
      case 'INVALID':
        break;
    }
    return {
      status: status,
    };
  }

  /**
   * Build the global fees object for the route
   * @param estimate
   * @private
   */
  private buildFees(estimate: Estimate): RouteFees {
    const totalFees = estimate.gasCosts.reduce((total: BigInteger, current: GasCost) => {
      return total.plus(BigInteger.fromString(current.amount));
    }, BigInteger.zero());

    const totalFeesInUsd = estimate.gasCosts.reduce((total: number, current: GasCost) => {
      return total + Number(current.amountUSD);
    }, 0);

    return new RouteFees(totalFees, totalFeesInUsd.toString());
  }

  /**
   * Create the steps of the route
   * @param step
   * @private
   */
  private createSteps(step: Step): RouteSteps {
    let steps = [];

    switch (step.type) {
      case 'swap':
        steps.push(this.createStep(step));
        break;
      case 'cross':
        steps.push(this.createStep(step));
        break;
      case 'lifi':
        steps = step.includedSteps.map((s) => this.createStep(s));
        break;
    }

    return new RouteSteps(steps);
  }

  /**
   * Create a single step
   * @param step
   * @private
   */
  private createStep(step: Step): RouteStep {
    const fromToken = new Token(
      step.action.fromToken.chainId.toString(),
      step.action.fromToken.name,
      step.action.fromToken.address,
      step.action.fromToken.decimals,
      step.action.fromToken.symbol,
      step.action.fromToken.logoURI,
    );
    const toToken = new Token(
      step.action.toToken.chainId.toString(),
      step.action.toToken.name,
      step.action.toToken.address,
      step.action.toToken.decimals,
      step.action.toToken.symbol,
      step.action.toToken.logoURI,
    );

    const feeInUSD = this.computeFeeInUsd(step.estimate);

    let type;
    switch (step.type) {
      case 'swap':
        type = RouteStep.TYPE_SWAP;
        break;
      case 'cross':
        type = RouteStep.TYPE_BRIDGE;
        break;
    }

    const details = new ProviderDetails(step.toolDetails.name, step.toolDetails.logoURI);

    return new RouteStep(
      type,
      details,
      fromToken,
      toToken,
      BigInteger.fromString(step.estimate.fromAmount),
      BigInteger.fromString(step.estimate.toAmount),
      feeInUSD.toString(),
      step.estimate.executionDuration,
    );
  }

  private computeFeeInUsd(estimate: Estimate): number {
    let feeInUSD = 0;
    if (estimate.gasCosts) {
      for (const entry of estimate.gasCosts) {
        feeInUSD += this.computeEntryCost(entry.amountUSD, entry.amount, entry.token);
      }
    }
    if (estimate.feeCosts) {
      for (const entry of estimate.feeCosts) {
        feeInUSD += this.computeEntryCost(entry.amountUSD, entry.amount, entry.token);
      }
    }
    return feeInUSD;
  }

  private computeEntryCost(amountUSD: string, amount: string, token: LifiToken): number {
    if (amountUSD) {
      return Number(amountUSD);
    } else if (amount && token.priceUSD) {
      return Number(ethers.utils.formatUnits(amount, token.decimals)) * Number(token.priceUSD);
    } else {
      return 0;
    }
  }
}
