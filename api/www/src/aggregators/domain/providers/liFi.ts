import { Aggregator, ExternalAggregator, MetadataProviderAggregator } from '../aggregator';
import { AggregatorRequest } from '../aggregator-request';
import LIFI, { Estimate, GasCost, Step } from '@lifi/sdk';
import { BigInteger } from '../../../shared/domain/big-integer';
import { TransactionDetails } from '../../../shared/domain/route/transaction-details';
import { Route } from '../../../shared/domain/route/route';
import { Token } from '../../../shared/domain/token';
import { InsufficientLiquidity } from '../../../swaps/domain/insufficient-liquidity';
import { ProviderDetails } from '../../../shared/domain/provider-details';
import { RouteResume } from '../../../shared/domain/route/route-resume';
import { AggregatorProviders } from './aggregator-providers';
import { AggregatorDetails } from '../../../shared/domain/aggregator-details';
import { ApprovalTransactionDetails } from '../../../shared/domain/route/approval-transaction-details';
import { RouterCallEncoder } from '../../../shared/domain/router-call-encoder';
import { RouteFees } from '../../../shared/domain/route/route-fees';
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
import { Logger } from '../../../shared/domain/logger';

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
  private logger: Logger;

  public static create(logger: Logger) {
    return new LiFi(new LIFI(), logger);
  }

  constructor(client: LIFI, logger: Logger) {
    this.client = client;
    this.routerCallEncoder = new RouterCallEncoder();
    this.logger = logger;
  }

  isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return this.enabledChains.includes(fromChainId) && this.enabledChains.includes(toChainId);
  }

  public async getMetadata(): Promise<AggregatorMetadata> {
    let chains, tokens;
    try {
      const results = await Promise.all([this.client.getChains(), this.client.getTokens()]);
      const chainsResponse = results[0];
      const tokensResponse = results[1];
      chains = chainsResponse.map((chain) => {
        return {
          type: chain.chainType,
          id: chain.id.toString(),
          name: chain.name,
          logo: chain.logoURI,
          metamask: {
            chainName: chain.metamask.chainName,
            blockExplorerUrls: chain.metamask.blockExplorerUrls,
            nativeCurrency: {
              name: chain.metamask.nativeCurrency.name,
              symbol: chain.metamask.nativeCurrency.symbol,
              decimals: chain.metamask.nativeCurrency.decimals,
            },
            rpcUrls: chain.metamask.rpcUrls,
          },
        };
      });
      tokens = {};
      for (const [chainId, tokensList] of Object.entries(tokensResponse.tokens)) {
        tokens[chainId.toString()] = tokensList.map((token) => {
          return {
            chainId: token.chainId.toString(),
            address: this.fromProviderAddress(token.address),
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            logo: token.logoURI,
            price: token.priceUSD,
          };
        });
      }
    } catch (e) {
      this.logger.error(`LiFi failed to fetch metadata: ${e}`);
      chains = [];
      tokens = {};
    }

    return {
      chains: chains,
      tokens: tokens,
    };
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
        fromToken: this.toProviderAddress(request.fromToken),
        toChain: request.toChain,
        toToken: this.toProviderAddress(request.toToken),
        fromAmount: request.amountIn.toString(),
        fromAddress: request.senderAddress,
        toAddress: request.receiverAddress,
        slippage: request.slippage / 100,
      });
    } catch (e) {
      throw new InsufficientLiquidity();
    }

    if (!response.estimate || !response.action) {
      throw new InsufficientLiquidity();
    }

    const transactionDetails = new TransactionDetails(
      response.transactionRequest.to,
      response.transactionRequest.data.toString(),
      BigInteger.fromString(response.transactionRequest.value.toString()),
      BigInteger.fromString(response.transactionRequest.gasLimit.toString()),
    );

    const fees = this.buildFees(response.estimate);
    let providerDetails: ProviderDetails[] = [];
    switch (response.type) {
      case 'swap':
        providerDetails.push(
          new ProviderDetails(response.toolDetails.name, response.toolDetails.logoURI),
        );
        break;
      case 'cross':
        providerDetails.push(
          new ProviderDetails(response.toolDetails.name, response.toolDetails.logoURI),
        );
        break;
      case 'lifi':
        providerDetails = this.buildProviderDetails(response.includedSteps);
        break;
    }

    const resume = new RouteResume(
      request.fromChain,
      request.toChain,
      request.fromToken,
      request.toToken,
      request.amountIn,
      BigInteger.fromString(response.estimate.toAmount),
      BigInteger.fromString(response.estimate.toAmountMin),
      response.estimate.executionDuration,
    );

    const bridgeTrackingId = request.fromChain !== request.toChain ? response.tool : '';

    const aggregatorDetails = new AggregatorDetails(
      AggregatorProviders.LiFi,
      '',
      false,
      false,
      bridgeTrackingId,
    );

    return new Route(
      aggregatorDetails,
      resume,
      fees,
      providerDetails,
      response.estimate.approvalAddress,
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
      srcTxHash: response.sending.txHash,
      dstTxHash: response.receiving?.txHash,
      amountIn: BigInteger.fromString(response.sending.amount),
      amountOut: response.receiving
        ? BigInteger.fromString(response.receiving.amount)
        : BigInteger.zero(),
      fromToken: this.fromProviderAddress(response.sending.token.address),
      toToken: response.receiving ? this.fromProviderAddress(response.receiving.token.address) : '',
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
   * Builds the set of provider details
   * @param steps
   * @private
   */
  private buildProviderDetails(steps: Step[]): ProviderDetails[] {
    const items: ProviderDetails[] = [];
    for (const step of steps) {
      items.push(new ProviderDetails(step.toolDetails.name, step.toolDetails.logoURI));
    }
    return items;
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
}
