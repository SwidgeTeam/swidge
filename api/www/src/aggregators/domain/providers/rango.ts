import { AggregatorRequest } from '../aggregator-request';
import { EvmTransaction, RangoClient, SwapFee, TransactionStatus } from 'rango-sdk-basic';
import { Route } from '../../../shared/domain/route/route';
import { AggregatorDetails } from '../../../shared/domain/aggregator-details';
import { AggregatorProviders } from './aggregator-providers';
import { RouteResume } from '../../../shared/domain/route/route-resume';
import { BigInteger } from '../../../shared/domain/big-integer';
import { Token } from '../../../shared/domain/token';
import { ProviderDetails } from '../../../shared/domain/provider-details';
import { InsufficientLiquidity } from '../../../swaps/domain/insufficient-liquidity';
import { QuotePath } from 'rango-sdk-basic/lib/types/api/common';
import {
  Arbitrum,
  Aurora,
  Avalanche,
  Boba,
  BSC,
  Cronos,
  Evmos,
  Fantom,
  Fuse,
  Harmony,
  Huobi,
  Mainnet,
  Moonbeam,
  Moonriver,
  OKT,
  Optimism,
  Polygon,
  xDAI,
} from '../../../shared/enums/ChainIds';
import { TransactionDetails } from '../../../shared/domain/route/transaction-details';
import { ApprovalTransactionDetails } from '../../../shared/domain/route/approval-transaction-details';
import BothTxs from '../both-txs';
import {
  Aggregator,
  ExternalAggregator,
  MetadataProviderAggregator,
  OneSteppedAggregator,
} from '../aggregator';
import {
  ExternalTransactionStatus,
  StatusCheckRequest,
  StatusCheckResponse,
} from '../status-check';
import { RouteFees } from '../../../shared/domain/route/route-fees';
import { AggregatorMetadata } from '../../../shared/domain/metadata';
import { NATIVE_TOKEN_ADDRESS } from '../../../shared/enums/Natives';
import { ethers } from 'ethers';
import { Logger } from '../../../shared/domain/logger';

interface MetadataResponse {
  blockchains: BlockchainMeta[];
  tokens: RangoToken[];
}

declare type BlockchainMeta = {
  name: string;
  displayName: string;
  chainId: string | null;
  defaultDecimals: number;
  logo: string;
  type: string;
  info: {
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrls: string[];
    rpcUrls: string[];
  };
};

declare type RangoToken = {
  blockchain: string;
  address: string | null;
  symbol: string;
  decimals: number;
  image: string;
  usdPrice: number;
};

export class Rango
  implements Aggregator, OneSteppedAggregator, ExternalAggregator, MetadataProviderAggregator
{
  private enabled = true;
  private enabledChains = [
    Mainnet,
    Optimism,
    BSC,
    Polygon,
    Fantom,
    Avalanche,
    Moonriver,
    Boba,
    Huobi,
    Moonbeam,
    Cronos,
    Aurora,
    xDAI,
    Harmony,
    Arbitrum,
    Evmos,
    Fuse,
  ];
  private client: RangoClient;
  private logger: Logger;

  public static create(apiKey: string, logger: Logger): Rango {
    return new Rango(new RangoClient(apiKey), logger);
  }

  constructor(client: RangoClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return (
      this.enabled &&
      this.enabledChains.includes(fromChainId) &&
      this.enabledChains.includes(toChainId)
    );
  }

  public async getMetadata(): Promise<AggregatorMetadata> {
    if (!this.enabled) {
      return {
        chains: [],
        tokens: {},
      };
    }

    let chains, tokens;
    try {
      const acceptedChains = [];
      const metaResponse = (await this.client.meta()) as unknown as MetadataResponse;
      chains = metaResponse.blockchains
        .filter((chain) => chain.type === 'EVM')
        .map((chain) => {
          acceptedChains.push(chain.name);
          return {
            id: chain.chainId,
            type: chain.type,
            name: chain.displayName,
            logo: chain.logo,
            metamask: {
              chainName: chain.info.chainName,
              blockExplorerUrls: chain.info.blockExplorerUrls,
              nativeCurrency: {
                name: chain.info.nativeCurrency.name,
                symbol: chain.info.nativeCurrency.symbol,
                decimals: chain.info.nativeCurrency.decimals,
              },
              rpcUrls: chain.info.rpcUrls,
            },
          };
        });
      tokens = {};
      metaResponse.tokens
        .filter((token) => acceptedChains.includes(token.blockchain))
        .forEach((token) => {
          const chainId = this.getChainId(token.blockchain);
          if (!tokens[chainId]) {
            // create the array if it doesnt exist
            tokens[chainId] = [];
          }
          tokens[chainId].push({
            chainId: chainId,
            address: this.fromProviderAddress(token.address),
            name: token.symbol,
            symbol: token.symbol,
            decimals: token.decimals,
            logo: token.image,
            price: token.usdPrice ? token.usdPrice.toString() : '0',
          });
        });
    } catch (e) {
      this.logger.error(`Rango failed to fetch metadata: ${e}`);
      chains = [];
      tokens = {};
    }

    return {
      chains: chains,
      tokens: tokens,
    };
  }

  /**
   * Entrypoint to quote a Route from Rango.exchange
   * @param request
   */
  async execute(request: AggregatorRequest): Promise<Route> {
    const response = await this.client.quote({
      from: {
        blockchain: this.getBlockchainCode(request.fromChain),
        address: this.toProviderAddress(request.fromToken),
        symbol: request.fromToken.symbol,
      },
      to: {
        blockchain: this.getBlockchainCode(request.toChain),
        address: this.toProviderAddress(request.toToken),
        symbol: request.toToken.symbol,
      },
      amount: request.amountIn.toString(),
    });

    if (response.resultType !== 'OK') {
      throw new InsufficientLiquidity();
    }

    const aggregatorDetails = new AggregatorDetails(AggregatorProviders.Rango, '', true, true);

    const fees = this.buildFees(response.route.fee);
    const providerDetails = this.buildProviderDetails(response.route.path);

    const amountOut = BigInteger.fromString(response.route.outputAmount);
    const resume = new RouteResume(
      request.fromChain,
      request.toChain,
      request.fromToken,
      request.toToken,
      request.amountIn,
      amountOut,
      amountOut,
      response.route.estimatedTimeInSeconds,
    );

    return new Route(aggregatorDetails, resume, fees, providerDetails);
  }

  /**
   * Builds callData transactions
   * @param request
   */
  public async buildTxs(request: AggregatorRequest): Promise<BothTxs> {
    const response = await this.client.swap({
      from: {
        blockchain: this.getBlockchainCode(request.fromChain),
        address: this.toProviderAddress(request.fromToken),
        symbol: request.fromToken.symbol,
      },
      to: {
        blockchain: this.getBlockchainCode(request.toChain),
        address: this.toProviderAddress(request.toToken),
        symbol: request.toToken.symbol,
      },
      amount: request.amountIn.toString(),
      fromAddress: request.senderAddress,
      toAddress: request.receiverAddress,
      referrerAddress: null,
      referrerFee: null,
      disableEstimate: true,
      slippage: request.slippage.toString(),
    });

    if (response.resultType !== 'OK' || !response.tx) {
      throw new InsufficientLiquidity();
    }

    console.log(response);

    const tx = response.tx as EvmTransaction;

    const approvalTx =
      tx.approveTo && tx.approveData
        ? new ApprovalTransactionDetails(tx.approveTo, tx.approveData)
        : null;

    const mainTx = new TransactionDetails(
      tx.txTo,
      tx.txData,
      tx.value ? BigInteger.fromString(tx.value) : BigInteger.zero(),
      tx.gasLimit ? BigInteger.fromString(tx.gasLimit) : BigInteger.zero(),
    );

    return new BothTxs(response.requestId, approvalTx, mainTx);
  }

  /**
   * Checks and returns the current status of the transaction
   * @param request
   */
  async checkStatus(request: StatusCheckRequest): Promise<StatusCheckResponse> {
    const response = await this.client.status({
      requestId: request.trackingId,
      txId: request.txHash,
    });
    let status;
    switch (response.status) {
      case null:
      case TransactionStatus.RUNNING:
        status = ExternalTransactionStatus.Pending;
        break;
      case TransactionStatus.FAILED:
        status = ExternalTransactionStatus.Failed;
        break;
      case TransactionStatus.SUCCESS:
        status = ExternalTransactionStatus.Success;
        break;
    }
    const d = response.bridgeData;

    return {
      status: status,
      srcTxHash: d ? d.srcTxHash : '',
      dstTxHash: d ? d.destTxHash : '',
      amountIn: d.srcTokenAmt ? BigInteger.fromString(d.srcTokenAmt) : BigInteger.zero(),
      amountOut: d.destTokenAmt ? BigInteger.fromString(d.destTokenAmt) : BigInteger.zero(),
      fromToken: d ? this.fromProviderAddress(d.srcToken) : '',
      toToken: d ? this.fromProviderAddress(d.destToken) : '',
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    txHash: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    trackingId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toAddress: string,
  ): Promise<void> {
    // this provider does not need to be informed
    return;
  }

  /**
   * Computes and returns the fees
   * @param fees
   * @private
   */
  private buildFees(fees: SwapFee[]): RouteFees {
    let amountWei = BigInteger.zero();
    let feesInUsd = 0;
    for (const fee of fees) {
      if (fee.expenseType === 'FROM_SOURCE_WALLET') {
        const amount = BigInteger.fromString(fee.amount);
        amountWei = amountWei.plus(amount);
        const usdAmount =
          Number(ethers.utils.formatUnits(fee.amount, fee.token.decimals)) *
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Number(fee.token.usdPrice);
        feesInUsd += usdAmount;
      }
    }
    return new RouteFees(amountWei, feesInUsd.toString());
  }

  /**
   * Builds the set of provider details
   * @param steps
   * @private
   */
  private buildProviderDetails(steps: QuotePath[]): ProviderDetails[] {
    const items: ProviderDetails[] = [];
    for (const step of steps) {
      items.push(new ProviderDetails(step.swapper.title, step.swapper.logo));
    }
    return items;
  }

  /**
   * Returns the custom blockchain code of Rango API
   * @param chainId
   * @private
   */
  private getBlockchainCode(chainId: string): string {
    switch (chainId) {
      case Mainnet:
        return 'ETH';
      case Optimism:
        return 'OPTIMISM';
      case BSC:
        return 'BSC';
      case Polygon:
        return 'POLYGON';
      case Fantom:
        return 'FANTOM';
      case Avalanche:
        return 'AVAX_CCHAIN';
      case Moonriver:
        return 'MOONRIVER';
      case Boba:
        return 'BOBA';
      case Huobi:
        return 'HECO';
      case Moonbeam:
        return 'MOONBEAM';
      case Cronos:
        return 'CRONOS';
      case Aurora:
        return 'AURORA';
      case xDAI:
        return 'GNOSIS';
      case Harmony:
        return 'HARMONY';
      case Arbitrum:
        return 'ARBITRUM';
      case Evmos:
        return 'EVMOS';
      case Fuse:
        return 'FUSE';
      case OKT:
        return 'OKC';
      default:
        throw new Error('blockchain not supported');
    }
  }

  private getChainId(code: string): string {
    switch (code) {
      case 'ETH':
        return Mainnet;
      case 'OPTIMISM':
        return Optimism;
      case 'BSC':
        return BSC;
      case 'POLYGON':
        return Polygon;
      case 'FANTOM':
        return Fantom;
      case 'AVAX_CCHAIN':
        return Avalanche;
      case 'MOONRIVER':
        return Moonriver;
      case 'BOBA':
        return Boba;
      case 'HECO':
        return Huobi;
      case 'MOONBEAM':
        return Moonbeam;
      case 'CRONOS':
        return Cronos;
      case 'AURORA':
        return Aurora;
      case 'GNOSIS':
        return xDAI;
      case 'HARMONY':
        return Harmony;
      case 'ARBITRUM':
        return Arbitrum;
      case 'EVMOS':
        return Evmos;
      case 'FUSE':
        return Fuse;
      case 'OKC':
        return OKT;
      default:
        throw new Error('blockchain not supported');
    }
  }

  private fromProviderAddress(address: string): string {
    return address === null ? NATIVE_TOKEN_ADDRESS : address;
  }

  private toProviderAddress(token: Token): string {
    return token.isNative() ? null : token.address;
  }
}
