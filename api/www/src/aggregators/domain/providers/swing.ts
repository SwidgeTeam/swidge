import { Aggregator, ExternalAggregator, MetadataProviderAggregator } from '../aggregator';
import { AggregatorRequest } from '../aggregator-request';
import SwingSDK, { Components } from '@swing.xyz/sdk';
import { Paths } from '@swing.xyz/sdk/gen/api.d';
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
import { RouteFees } from '../../../shared/domain/route/route-fees';
import { RouteSteps } from '../../../shared/domain/route/route-steps';
import {
  ExternalTransactionStatus,
  StatusCheckRequest,
  StatusCheckResponse,
} from '../status-check';
import { AggregatorMetadata } from '../../../shared/domain/metadata';
import { ethers } from 'ethers';
import { NATIVE_TOKEN_ADDRESS } from '../../../shared/enums/Natives';
import {
  Arbitrum,
  Aurora,
  Avalanche,
  Boba,
  BSC,
  Celo,
  Cronos,
  Fantom,
  Fuse,
  Harmony,
  Huobi,
  Mainnet,
  Metis,
  Moonbeam,
  Moonriver,
  OKT,
  Optimism,
  Polygon,
  Solana,
  xDAI,
} from '../../../shared/enums/ChainIds';
import { Logger } from '../../../shared/domain/logger';

export class Swing implements Aggregator, ExternalAggregator, MetadataProviderAggregator {
  private enabledChains = [
    Solana,
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
    Metis,
    Moonbeam,
    Moonriver,
    Arbitrum,
    Avalanche,
    Aurora,
    Harmony,
  ];
  private client: SwingSDK;
  private logger: Logger;

  public static create(logger: Logger) {
    return new Swing(new SwingSDK(), logger);
  }

  constructor(client: SwingSDK, logger: Logger) {
    this.client = client; // do we need to initialise this? i.e. .init() -- we good, initializing on the static call
    this.logger = logger;
  }

  // code still relevant -- yeah, so we have granular control over where we enable providers
  isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return this.enabledChains.includes(fromChainId) && this.enabledChains.includes(toChainId);
  }

  // check with Sandro
  public async getMetadata(): Promise<AggregatorMetadata> {
    const chains = this.client.chains.map((chain) => {
      return {
        id: chain.chainId.toString(),
        name: chain.name,
        logo: chain.logo,
        rpcUrls: chain.rpcUrls,
        // missing fields to completed IChain
      };
    });
    const tokens = {};
    for (const token of this.client.tokens) {
      tokens[token.chainId.toString()] = this.client.tokens.map((token) => {
        return {
          chainId: token.chainId.toString(),
          address: this.fromProviderAddress(token.address),
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          logo: token.logoURI,
        };
      });
    }

    return {
      chains: chains,
      tokens: tokens,
    };
  }

  /**
   * Entrypoint to quote a Route from Swing
   * @param request
   */

  async execute(request: AggregatorRequest): Promise<Route> {
    let response;
    const fromChain = request.fromChain as Components.Schemas.ChainSlug;
    // would this syntax work? ^
    // it would if we were sure that the chain "key"/slug are the same for them and for us,
    // but we are using the
    // chainID and they are using a string. So we need converting
    const toChain = request.toChain;

    try {
      response = await this.client.getQuote({
        fromChain: fromChain,
        toChain: this.toProviderChainType(toChain),
        fromToken: request.fromToken.symbol as Components.Schemas.TokenSymbol,
        toToken: request.toToken.symbol as Components.Schemas.TokenSymbol,
        amount: request.amountIn.toString(),
        fromUserAddress: request.senderAddress,
        toUserAddress: request.receiverAddress,
      });
    } catch (e) {
      throw new InsufficientLiquidity();
    }
    if (!response.routes || response.routes.length === 0) {
      throw new InsufficientLiquidity();
    }

    const route = response.routes[0];

    const steps = this.createSteps(response);
    const fees = this.buildFees(response.estimate);

    const resume = new RouteResume(
      request.fromChain,
      request.toChain,
      request.fromToken,
      request.toToken,
      request.amountIn,
      BigInteger.fromString(route.quote),
      BigInteger.fromString(route.quote),
      steps.totalExecutionTime(),
    );

    const bridgeTrackingId = request.fromChain !== request.toChain ? route.bridge : '';

    const aggregatorDetails = new AggregatorDetails(
      AggregatorProviders.Swing,
      '',
      false,
      false,
      bridgeTrackingId,
    );

    return new Route(aggregatorDetails, resume, steps, fees);
  }

  /**
   * Builds the required transaction to approve the assets
   * @param approvalData
   */
  public async approveBridge(
    approvalData: Paths.V0TransferGetApproval.QueryParameters,
  ): Promise<ApprovalTransactionDetails> {
    const txApproval = await this.client.api.getApproval({
      bridge: approvalData.bridge,
      fromAddress: approvalData.fromAddress,
      fromChain: approvalData.fromChain,
      fromChainId: approvalData.fromChainId,
      toChain: approvalData.toChain,
      toChainId: approvalData.toChainId,
      tokenAddress: approvalData.tokenAddress,
      tokenAmount: approvalData.tokenAmount,
      tokenSymbol: approvalData.tokenSymbol,
    });
    return new ApprovalTransactionDetails(txApproval.to, txApproval.data);
  }

  /**
   * Builds the transaction for the aggregator
   * @param transactionRequest
   */
  public async sendSwap(
    request: Paths.V0TransferTransferToken.RequestBody,
  ): Promise<TransactionDetails> {
    const tx = await this.client.api.transferToken({ request });

    return new TransactionDetails(
      tx.tx.to,
      tx.tx.data,
      BigInteger.fromString(tx.tx.value),
      BigInteger.fromString(tx.tx.gas),
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
   * Checks and returns the current status of the transaction
   * @param request
   */

  async checkStatus(request: StatusCheckRequest): Promise<StatusCheckResponse> {
    const response = await this.client.api.getStatus({
      txHash: request.txHash,
      fromChain: this.toProviderChainType(request.fromChain),
      toChain: this.toProviderChainType(request.toChain),
      bridge: request.trackingId, // we can simply send `trackingId` cos its the puprose of it, it will be sent to frontend when asking for calldata
    });
    let status;
    switch (response.status) {
      case 'Failed Source Chain':
        status = ExternalTransactionStatus.Failed;
        break;
      case 'Failed Destination Chain':
        status = ExternalTransactionStatus.Failed;
        break;
      case 'Refunded':
        status = ExternalTransactionStatus.Failed;
        break;
      case 'Refund Required':
        status = ExternalTransactionStatus.Failed;
        break;
      case 'Completed':
        status = ExternalTransactionStatus.Success;
        break;
      case 'Submitted':
      case 'Pending Source Chain':
      case 'Pending Destination Chain':
    }
    // only the status field is a required response
    return {
      status: status,
      srcTxHash: response.fromChainTxHash ? response.fromChainTxHash : '',
      dstTxHash: response.toChainTxHash ? response.toChainTxHash : '',
      amountIn: response.fromAmount
        ? BigInteger.fromString(response.fromAmount)
        : BigInteger.zero(),
      amountOut:
        response.status === 'Completed'
          ? BigInteger.fromString(response.toAmount)
          : BigInteger.zero(),
      fromToken: response.fromTokenAddress
        ? this.fromProviderAddress(response.fromTokenAddress) // curious to see which address they use for native coin (prob either 0xeeeee.., 0x0000.. or null)
        : '',
      toToken:
        response.status === 'Completed' ? this.fromProviderAddress(response.toTokenAddress) : '',
    };
  }

  /**
   * Build the global fees object for the route
   * @param estimate
   * @private
   */
  //
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

  /**
   * converts an address to our internal format
   * @param address
   * @private
   */

  private fromProviderAddress(address: string): string {
    return address === ethers.constants.AddressZero ? NATIVE_TOKEN_ADDRESS : address;
  }

  /**
   * makes sure an address is in the format the provider uses
   * @param token
   * @private
   */

  private toProviderAddress(token: Token): string {
    return token.isNative() ? ethers.constants.AddressZero : token.address;
  }

  /**
   * makes sure a chain is in the format the provider uses
   * @param chain
   * @private
   */

  private toProviderChainType(chain: string): Components.Schemas.ChainSlug {
    switch (chain) {
      case Mainnet:
        return 'ethereum';
      case Arbitrum:
        return 'arbitrum';
      case Avalanche:
        return 'avalanche';
      case Boba:
        return 'boba';
      case BSC:
        return 'bsc';
      case Celo:
        return 'celo';
      case Cronos:
        return 'cronos';
      case Fantom:
        return 'fantom';
      case Fuse:
        return 'fuse';
      case xDAI:
        return 'gnosis';
      case Harmony:
        return 'harmony';
      case Huobi:
        return 'heco';
      case Metis:
        return 'metis';
      case Moonbeam:
        return 'moonbeam';
      case Moonriver:
        return 'moonriver';
      //case 'fuji':
      //  return 'fuji';
      case Aurora:
        return 'aurora';
      case 'oec':
        return 'oec';
      case Optimism:
        return 'optimism';
      case Polygon:
        return 'polygon';
      //case 'solana':
      //  return 'solana';
      //case 'oasis':
      //  return 'oasis';
      //case 'dfk':
      //  return 'dfk';
      //case 'bttc':
      //  return 'bttc';
      //case 'kcc':
      //  return 'kcc';
      //case 'gather':
      //  return 'gather';
      default:
        throw new Error('blockchain not supported');
    }
  }

  /**
   * makes sure a bridge is in the format the provider uses
   * @param bridge
   * @private
   */
  private toProviderBridgeType(bridge: string): Components.Schemas.Bridge {
    let bridgeSlug: Components.Schemas.Bridge;
    switch (bridge) {
      case 'nxtp':
        return 'nxtp';
      case 'hop':
        return 'hop';
      case 'celer':
        return 'celer';
      case 'debridge':
        return 'debridge';
      case 'anyswap':
        return 'anyswap';
      case 'hyphen':
        return 'hyphen';
      case 'nxtp':
        return 'nxtp';
      case 'across':
        return 'across';
      case 'wormhole':
        return 'wormhole';
      case 'synapse':
        return 'synapse';
      default:
        throw new Error('bridge not supported');
    }
  }
}
