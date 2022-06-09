import { RouterCaller, FinalizeCrossParams } from './router-caller';
import { Inject, Injectable } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { RpcNode } from '../../shared/RpcNode';
import {
  SwapRequest,
  TransactionsRepository,
  UpdateTransactionPayload,
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

    const swapOrder = await this.transactionRepository.quoteSwap(<SwapRequest>{
      chainId: job.toChainId,
      tokenIn: job.srcToken,
      tokenOut: job.dstToken,
      amountIn: job.bridgeAmountOut,
    });

    // Execute transaction
    const params: FinalizeCrossParams = {
      rpcNode: RpcNode[job.toChainId],
      routerAddress: job.router,
      receiverAddress: job.walletAddress,
      txHash: job.txHash,
      swap: {
        providerCode: swapOrder.providerCode,
        amountIn: job.bridgeAmountOut,
        tokenIn: swapOrder.tokenIn,
        tokenOut: swapOrder.tokenOut,
        data: swapOrder.data,
        required: swapOrder.required,
      },
    };

    this.logger.log('Calling contract w/ ', params);

    await this.routerCaller.call(params);

    this.logger.log('Tx executed');

    await this.transactionRepository.update(<UpdateTransactionPayload>{
      txHash: job.txHash,
      bridgeAmountOut: job.bridgeAmountOut,
      bridged: new Date(),
    });

    this.logger.log('Tx updated');
  }
}
