import { Aggregator } from '../aggregator';
import { AggregatorRequest } from '../aggregator-request';
import { Route } from '../../../shared/domain/route';
import { InsufficientLiquidity } from '../../../swaps/domain/insufficient-liquidity';
import { IHttpClient } from '../../../shared/domain/http/IHttpClient';
import { TransactionDetails } from '../../../shared/domain/transaction-details';
import { BigInteger } from '../../../shared/domain/big-integer';
import { RouteResume } from '../../../shared/domain/route-resume';
import { RouteStep } from '../../../shared/domain/route-step';
import { Token } from '../../../shared/domain/token';
import { ProviderDetails } from '../../../shared/domain/provider-details';
import { AggregatorProviders } from './aggregator-providers';

// whole Route details
interface SocketRoute {
  toAmount: string;
  userTxs: SocketUserTx[];
}

// details of one user TX
interface SocketUserTx {
  steps: SocketUserTxStep[];
  serviceTime: number;
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

export class Socket implements Aggregator {
  private enabledChains: string[];
  private client: IHttpClient;
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;

  constructor(httpClient: IHttpClient) {
    this.enabledChains = [];
    this.client = httpClient;
    this.apiKey = '645b2c8c-5825-4930-baf3-d9b997fcd88c'; // public testing key
    this.apiBaseUrl = 'https://api.socket.tech/v2';
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
        userAddress: '0x0000000000000000000000000000000000000000',
        uniqueRoutesPerBridge: true,
        sort: 'output',
        singleTxOnly: true,
      },
      headers: {
        'API-KEY': this.apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.success || response.result.routes.length === 0) {
      throw new InsufficientLiquidity();
    }

    const route = response.result.routes[0];
    const amountOut = BigInteger.fromString(route.toAmount);
    const resume = new RouteResume(
      request.fromChain,
      request.toChain,
      request.fromToken,
      request.toToken,
      request.amountIn,
      amountOut,
      amountOut,
    );
    const txDetails = await this.getTxDetails(route);
    const steps = this.buildSteps(route.userTxs[0].steps);

    return new Route(AggregatorProviders.Socket, resume, txDetails, steps);
  }

  /**
   * Quotes and constructs the transaction details
   * @param route
   * @private
   */
  private async getTxDetails(route: any): Promise<TransactionDetails> {
    const response = await this.client.post<{
      result: {
        txData: string;
        txTarget: string;
        value: string;
        approvalData: SocketApprovalData | null;
      };
    }>(`${this.apiBaseUrl}/build-tx`, {
      headers: {
        'API-KEY': this.apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      params: JSON.stringify({ route: route }),
    });

    const approvalAddress = response.result.approvalData
      ? response.result.approvalData.allowanceTarget
      : null;

    return new TransactionDetails(
      response.result.txTarget,
      approvalAddress,
      response.result.txData,
      BigInteger.fromString(response.result.value),
      BigInteger.fromString(response.result.value),
      BigInteger.fromString(response.result.value),
    );
  }

  /**
   * Builds the whole set of steps
   * @param steps
   * @private
   */
  private buildSteps(steps: SocketUserTxStep[]): RouteStep[] {
    const items: RouteStep[] = [];
    for (const step of steps) {
      items.push(this.buildStep(step));
    }
    return items;
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
        return RouteStep.swap(details, fromToken, toToken, amountIn, amountOut, feeInUSD);
      case 'bridge':
        return RouteStep.bridge(details, fromToken, toToken, amountIn, amountOut, feeInUSD);
    }
  }
}
