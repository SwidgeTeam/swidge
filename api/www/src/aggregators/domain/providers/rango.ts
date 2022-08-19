import { AggregatorRequest } from '../aggregator-request';
import { EvmTransaction, RangoClient, TransactionStatus } from 'rango-sdk-basic';
import { Route } from '../../../shared/domain/route/route';
import { AggregatorDetails } from '../../../shared/domain/aggregator-details';
import { AggregatorProviders } from './aggregator-providers';
import { RouteResume } from '../../../shared/domain/route/route-resume';
import { BigInteger } from '../../../shared/domain/big-integer';
import { RouteStep } from '../../../shared/domain/route/route-step';
import { Token } from '../../../shared/domain/token';
import { ProviderDetails } from '../../../shared/domain/provider-details';
import { InsufficientLiquidity } from '../../../swaps/domain/insufficient-liquidity';
import { QuotePath } from 'rango-sdk-basic/lib/types/api/common';
import { Avalanche, BSC, Fantom, Mainnet, Optimism, Polygon } from '../../../shared/enums/ChainIds';
import { TransactionDetails } from '../../../shared/domain/route/transaction-details';
import { ApprovalTransactionDetails } from '../../../shared/domain/route/approval-transaction-details';
import BothTxs from '../both-txs';
import { Aggregator, ExternalAggregator, OneSteppedAggregator } from '../aggregator';
import {
  ExternalTransactionStatus,
  StatusCheckRequest,
  StatusCheckResponse,
} from '../status-check';

export class Rango implements Aggregator, OneSteppedAggregator, ExternalAggregator {
  private enabledChains: string[];
  private client: RangoClient;

  public static create(apiKey: string): Rango {
    return new Rango(new RangoClient(apiKey));
  }

  constructor(client: RangoClient) {
    this.enabledChains = [];
    this.client = client;
  }

  isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return this.enabledChains.includes(fromChainId) && this.enabledChains.includes(toChainId);
  }

  /**
   * Entrypoint to quote a Route from Rango.exchange
   * @param request
   */
  async execute(request: AggregatorRequest): Promise<Route> {
    const response = await this.client.quote({
      from: {
        blockchain: this.getBlockchainCode(request.fromChain),
        address: request.fromToken.address,
        symbol: request.fromToken.symbol,
      },
      to: {
        blockchain: this.getBlockchainCode(request.toChain),
        address: request.toToken.address,
        symbol: request.toToken.symbol,
      },
      amount: request.amountIn.toString(),
    });

    if (response.resultType !== 'OK') {
      throw new InsufficientLiquidity();
    }

    const aggregatorDetails = new AggregatorDetails(
      AggregatorProviders.Rango,
      '',
      true,
      true,
      response.requestId,
    );
    const amountOut = BigInteger.fromString(response.route.outputAmount);
    const resume = new RouteResume(
      request.fromChain,
      request.toChain,
      request.fromToken,
      request.toToken,
      request.amountIn,
      amountOut,
      amountOut,
    );

    const steps = this.buildSteps(request.amountIn, response.route.path);

    return new Route(aggregatorDetails, resume, steps);
  }

  /**
   * Builds callData transactions
   * @param request
   */
  public async buildTxs(request: AggregatorRequest): Promise<BothTxs> {
    const response = await this.client.swap({
      from: {
        blockchain: this.getBlockchainCode(request.fromChain),
        address: request.fromToken.address,
        symbol: request.fromToken.symbol,
      },
      to: {
        blockchain: this.getBlockchainCode(request.toChain),
        address: request.toToken.address,
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
   * Builds the whole set of steps
   * @param generalAmountIn
   * @param steps
   * @private
   */
  private buildSteps(generalAmountIn: BigInteger, steps: QuotePath[]): RouteStep[] {
    const items: RouteStep[] = [];
    for (const step of steps) {
      const amountIn = items.length > 0 ? items[items.length - 1].amountOut : generalAmountIn;
      items.push(this.buildStep(amountIn, step));
    }
    return items;
  }

  /**
   * Builds a single step
   * @param amountIn
   * @param step
   * @private
   */
  private buildStep(amountIn: BigInteger, step: QuotePath): RouteStep {
    const fromToken = new Token(
      step.from.symbol,
      step.from.address,
      step.from.decimals,
      step.from.symbol,
    );
    const toToken = new Token(step.to.symbol, step.to.address, step.to.decimals, step.to.symbol);
    const details = new ProviderDetails(step.swapper.title, step.swapper.logo);
    const amountOut = BigInteger.fromString(step.expectedOutput);
    //const feeInUSD = step.gasFees.feesInUsd.toString();

    let type;
    switch (step.swapperType) {
      case 'DEX':
        type = RouteStep.TYPE_SWAP;
        break;
      case 'BRIDGE':
        type = RouteStep.TYPE_BRIDGE;
        break;
    }

    return new RouteStep(type, details, fromToken, toToken, amountIn, amountOut, '');
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
      default:
        throw new Error('blockchain not supported');
    }
  }
}
