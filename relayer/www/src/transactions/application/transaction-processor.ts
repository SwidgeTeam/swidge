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

    let swapDetails;

    if (job.srcToken === job.dstToken) {
      swapDetails = {
        providerCode: null,
        amountIn: job.bridgeAmountOut,
        tokenIn: job.srcToken,
        tokenOut: job.dstToken,
        estimatedGas: '',
        data: '0x',
        required: false,
      };
    } else {
      const swapOrder = await this.transactionRepository.quoteSwap(<
        SwapRequest
      >{
        chainId: job.toChainId,
        tokenIn: job.srcToken,
        tokenOut: job.dstToken,
        amountIn: job.bridgeAmountOut,
      });
      swapDetails = {
        providerCode: swapOrder.providerCode,
        amountIn: job.bridgeAmountOut,
        tokenIn: swapOrder.tokenIn,
        tokenOut: swapOrder.tokenOut,
        data: swapOrder.data,
        estimatedGas: swapOrder.estimatedGas,
        required: swapOrder.required,
      };
    }

    // Execute transaction
    const params: FinalizeCrossParams = {
      rpcNode: RpcNode[job.toChainId],
      routerAddress: job.router,
      receiverAddress: job.walletAddress,
      txHash: job.txHash,
      swap: swapDetails,
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
