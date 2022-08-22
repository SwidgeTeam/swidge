import { HttpClient } from '../../shared/http/httpClient';
import {
  CreateTransactionPayload,
  UpdateTransactionPayload,
  TransactionsRepository,
  SwapRequest,
} from '../domain/transactions-repository';
import { ConfigService } from '../../config/config.service';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { TransactionJson } from './transaction-json';
import { Transaction } from '../domain/transaction';
import { BigNumber } from 'ethers';
import { SwapOrder } from '../domain/swap-order';

export class TransactionsRepositoryImpl implements TransactionsRepository {
  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
  ) {}

  /**
   * Store a newly created transaction
   * @param payload
   */
  public async create(payload: CreateTransactionPayload): Promise<void> {
    await this.httpClient.post(
      `${this.configService.apiUrl}/transaction`,
      {
        txHash: payload.txHash,
        routerAddress: payload.routerAddress,
        walletAddress: payload.walletAddress,
        receiver: payload.receiver,
        fromChainId: payload.fromChainId,
        toChainId: payload.toChainId,
        srcToken: payload.srcToken,
        bridgeTokenIn: payload.bridgeTokenIn,
        bridgeTokenOut: payload.bridgeTokenOut,
        dstToken: payload.dstToken,
        amount: payload.amountIn.toString(),
      },
      this.headers(),
    );
  }

  /**
   * Store an existent transaction
   * @param payload
   */
  public async update(payload: UpdateTransactionPayload): Promise<void> {
    await this.httpClient.put(
      `${this.configService.apiUrl}/transaction`,
      {
        txHash: payload.txHash,
        destinationTxHash: payload.destinationTxHash ? payload.destinationTxHash : '',
        bridgeAmountIn: payload.bridgeAmountIn ? payload.bridgeAmountIn : '',
        bridgeAmountOut: payload.bridgeAmountOut ? payload.bridgeAmountOut : '',
        amountOut: payload.amountOut ? payload.amountOut : '',
        bridged: payload.bridged ? payload.bridged.getTime() : '',
        completed: payload.completed ? payload.completed.getTime() : '',
      },
      this.headers(),
    );
  }

  /**
   * Fetches the full transaction given a txHash
   * @param txHash
   */
  public async getTx(txHash: string): Promise<Transaction | null> {
    const response = await this.httpClient.get<TransactionJson>(
      `${this.configService.apiUrl}/transaction/${txHash}`,
      this.headers(),
    );

    if (response === null) {
      return null;
    }

    return new Transaction(
      response.txHash,
      response.walletAddress,
      response.routerAddress,
      response.fromChainId,
      response.toChainId,
      response.srcToken,
      response.bridgeTokenIn,
      response.bridgeTokenOut,
      response.dstToken,
      response.amountIn ? BigNumber.from(response.amountIn) : null,
      response.bridgeAmountIn ? BigNumber.from(response.bridgeAmountIn) : null,
      response.bridgeAmountOut ? BigNumber.from(response.bridgeAmountOut) : null,
      response.amountOut ? BigNumber.from(response.amountOut) : null,
      response.executed ? new Date(response.executed) : null,
      response.bridged ? new Date(response.bridged) : null,
      response.completed ? new Date(response.completed) : null,
    );
  }

  /**
   * Quote the required data for a swap
   * @param request
   */
  public async quoteSwap(request: SwapRequest): Promise<SwapOrder> {
    const response = await this.httpClient.get<{
      code: string;
      tokenIn: string;
      tokenOut: string;
      data: string;
      estimatedGas: string;
      required: boolean;
    }>(
      `${this.configService.apiUrl}/quote/swap` +
        `?chainId=${request.chainId}` +
        `&tokenIn=${request.tokenIn}` +
        `&tokenOut=${request.tokenOut}` +
        `&amountIn=${request.amountIn.toString()}` +
        `&minAmountOut=${request.minAmountOut}`,
    );

    return new SwapOrder(
      Number(response.code),
      response.tokenIn,
      response.tokenOut,
      response.data,
      response.estimatedGas,
      response.required,
    );
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.configService.apiAuthToken}`,
    };
  }
}
