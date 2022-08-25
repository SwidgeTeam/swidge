import { Aggregator, ExternalAggregator } from '../aggregator';
import { AggregatorRequest } from '../aggregator-request';
import { Route } from '../../../shared/domain/route/route';
import { InsufficientLiquidity } from '../../../swaps/domain/insufficient-liquidity';
import { IHttpClient } from '../../../shared/domain/http/IHttpClient';
import { TransactionDetails } from '../../../shared/domain/route/transaction-details';
import { BigInteger } from '../../../shared/domain/big-integer';
import { RouteResume } from '../../../shared/domain/route/route-resume';
import { RouteStep } from '../../../shared/domain/route/route-step';
import { Token } from '../../../shared/domain/token';
import { ProviderDetails } from '../../../shared/domain/provider-details';
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

// whole Route details
interface SocketRoute {
  routeId: string;
  toAmount: string;
  userTxs: SocketUserTx[];
}

// details of one user TX
interface SocketUserTx {
  steps: SocketUserTxStep[];
  serviceTime: number;
  gasFees: {
    gasAmount: string;
    gasLimit: number;
    feesInUsd: number;
  };
}

// details of one step of the TX
interface SocketUserTxStep {
  type: string;
  protocol: {
    displayName: string;
    icon: string;
  };
  fromAsset: SocketTokenDetails;
  toAsset: SocketTokenDetails;
  fromAmount: string;
  toAmount: string;
  gasFees: {
    gasLimit: number;
    feesInUsd: number;
  };
  serviceTime: number;
}

// details of a token
interface SocketTokenDetails {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

// details of the approval of tokens
interface SocketApprovalData {
  allowanceTarget: string;
}

export class Socket implements Aggregator, ExternalAggregator {
  private enabledChains = [];
  private client: IHttpClient;
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;
  private routerCallEncoder: RouterCallEncoder;

  constructor(httpClient: IHttpClient, apiKey: string) {
    this.client = httpClient;
    this.apiKey = apiKey;
    this.apiBaseUrl = 'https://api.socket.tech/v2';
    this.routerCallEncoder = new RouterCallEncoder();
  }

  isEnabledOn(fromChainId: string, toChainId: string): boolean {
    return this.enabledChains.includes(fromChainId) && this.enabledChains.includes(toChainId);
  }

  /**
   * Entrypoint to quote a Route from Socket.tech
   * @param request
   */
  async execute(request: AggregatorRequest): Promise<Route> {
    const response = await this.client.get<{
      success: boolean;
      result: {
        routes: SocketRoute[];
      };
    }>(`${this.apiBaseUrl}/quote`, {
      params: {
        fromChainId: request.fromChain,
        fromTokenAddress: request.fromToken.address,
        toChainId: request.toChain,
        toTokenAddress: request.toToken.address,
        fromAmount: request.amountIn.toString(),
        userAddress: request.senderAddress,
        uniqueRoutesPerBridge: true,
        sort: 'output',
        singleTxOnly: true,
      },
      headers: this.headers(),
    });

    if (!response.success || response.result.routes.length === 0) {
      throw new InsufficientLiquidity();
    }

    const route = response.result.routes[0];
    const amountOut = BigInteger.fromString(route.toAmount);

    const steps = this.buildSteps(route.userTxs[0].steps);

    const resume = new RouteResume(
      request.fromChain,
      request.toChain,
      request.fromToken,
      request.toToken,
      request.amountIn,
      amountOut,
      amountOut,
      steps.totalExecutionTime(),
    );
    const responseTxDetails = await this.getTxDetails(route);

    // if there's approvalData means we have to approve some token
    const approvalTxDetails = responseTxDetails.approvalData
      ? new ApprovalTransactionDetails(
          request.fromToken.address,
          this.routerCallEncoder.encodeApproval(
            responseTxDetails.approvalData.allowanceTarget,
            request.amountIn,
          ),
        )
      : null;

    const routeFees = route.userTxs[0].gasFees;
    const fees = new RouteFees(
      BigInteger.fromString(routeFees.gasAmount),
      routeFees.feesInUsd.toString(),
    );
    const gasLimit = BigInteger.fromString(routeFees.gasLimit.toString());

    const txDetails = new TransactionDetails(
      responseTxDetails.txTarget,
      responseTxDetails.txData,
      BigInteger.fromString(responseTxDetails.value),
      gasLimit,
    );

    const aggregatorDetails = new AggregatorDetails(AggregatorProviders.Socket);

    return new Route(aggregatorDetails, resume, steps, fees, approvalTxDetails, txDetails);
  }

  /**
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
    // pass
    // provider doesnt required to be informed
    return;
  }

  /**
   *
   * @param request
   */
  async checkStatus(request: StatusCheckRequest): Promise<StatusCheckResponse> {
    const response = await this.client.get<{
      success: boolean;
      result: {
        sourceTxStatus: string;
        destinationTxStatus: string;
      };
    }>(`${this.apiBaseUrl}/bridge-status`, {
      params: {
        transactionHash: request.txHash,
        fromChainId: request.fromChain,
        toChainId: request.toChain,
      },
      headers: this.headers(),
    });

    let status;

    switch (response.result.destinationTxStatus) {
      case 'COMPLETED':
        status = ExternalTransactionStatus.Success;
        break;
      case 'PENDING':
        status = ExternalTransactionStatus.Pending;
        break;
    }

    return {
      status: status,
    };
  }

  /**
   * Quotes and constructs the transaction details
   * @param route
   * @private
   */
  private async getTxDetails(route: SocketRoute): Promise<{
    txData: string;
    txTarget: string;
    value: string;
    approvalData: SocketApprovalData | null;
  }> {
    const response = await this.client.post<{
      result: {
        txData: string;
        txTarget: string;
        value: string;
        approvalData: SocketApprovalData | null;
      };
    }>(`${this.apiBaseUrl}/build-tx`, {
      headers: this.headers(),
      params: JSON.stringify({ route: route }),
    });

    return response.result;
  }

  /**
   * Builds the whole set of steps
   * @param steps
   * @private
   */
  private buildSteps(steps: SocketUserTxStep[]): RouteSteps {
    const items: RouteStep[] = [];
    for (const step of steps) {
      items.push(this.buildStep(step));
    }
    return new RouteSteps(items);
  }

  /**
   * Builds a single step
   * @param step
   * @private
   */
  private buildStep(step: SocketUserTxStep): RouteStep {
    const fromToken = new Token(
      step.fromAsset.name,
      step.fromAsset.address,
      step.fromAsset.decimals,
      step.fromAsset.symbol,
    );
    const toToken = new Token(
      step.toAsset.name,
      step.toAsset.address,
      step.toAsset.decimals,
      step.toAsset.symbol,
    );
    const details = new ProviderDetails(step.protocol.displayName, step.protocol.icon);
    const amountIn = BigInteger.fromString(step.fromAmount);
    const amountOut = BigInteger.fromString(step.toAmount);
    const feeInUSD = step.gasFees.feesInUsd.toString();

    switch (step.type) {
      case 'middleware':
        return RouteStep.swap(details, fromToken, toToken, amountIn, amountOut, feeInUSD, 0);
      case 'bridge':
        return RouteStep.bridge(
          details,
          fromToken,
          toToken,
          amountIn,
          amountOut,
          feeInUSD,
          step.serviceTime,
        );
    }
  }

  /**
   * Returns API headers
   * @private
   */
  private headers() {
    return {
      'API-KEY': this.apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }
}
