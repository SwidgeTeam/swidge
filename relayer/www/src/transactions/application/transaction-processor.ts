import { RouterCaller, FinalizeCrossParams } from './router-caller';
import { Inject, Injectable } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { RpcNode } from '../../shared/RpcNode';
import {
  SwapRequest,
  TransactionsRepository,
} from '../domain/TransactionsRepository';
import { TransactionJob } from '../domain/TransactionJob';
import { CustomLogger } from '../../logger/CustomLogger';

@Injectable()
export class TransactionProcessor {
  constructor(
    private readonly logger: CustomLogger,
    private readonly routerCaller: RouterCaller,
    @Inject(Class.TransactionsRepository)
    private readonly transactionRepository: TransactionsRepository,
  ) {}

  async execute(job: TransactionJob) {
    this.logger.log('Received job ', job);

    const swapDetails = await this.getSwapDetails(job);

    const rpc = RpcNode[job.toChainId];

    // Execute transaction
    const params: FinalizeCrossParams = {
      rpcNode: rpc,
      routerAddress: job.router,
      receiverAddress: job.walletAddress,
      txHash: job.txHash,
      swap: swapDetails,
    };

    this.logger.log('Calling contract w/ ', params);

    await this.routerCaller.call(params);

    this.logger.log('Tx executed');
  }

  /**
   * Computes the swap details given the job
   * @param job
   * @private
   */
  private async getSwapDetails(job: TransactionJob) {
    const swapOrder = await this.transactionRepository.quoteSwap(<SwapRequest>{
      chainId: job.toChainId,
      tokenIn: job.srcToken,
      tokenOut: job.dstToken,
      amountIn: job.bridgeAmountOut,
      minAmountOut: job.minAmountOut,
    });

    const fixGas = this.getFunctionEstimateGas();
    const estimatedGas = fixGas + swapOrder.estimatedGas;

    return {
      providerCode: swapOrder.providerCode,
      amountIn: job.bridgeAmountOut,
      tokenIn: swapOrder.tokenIn,
      tokenOut: swapOrder.tokenOut,
      estimatedGas: estimatedGas,
      data: swapOrder.data,
      required: swapOrder.required,
    };
  }

  private getFunctionEstimateGas() {
    return 500000;
  }
}
