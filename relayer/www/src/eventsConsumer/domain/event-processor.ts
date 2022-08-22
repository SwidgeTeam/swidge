import { CrossFinalized, CrossInitiated, MultichainDelivered, SwapExecuted } from './event-types';
import { Producer } from 'sqs-producer';
import {
  CreateTransactionPayload,
  TransactionsRepository,
  UpdateTransactionPayload,
} from '../../persistence/domain/transactions-repository';
import { Logger } from '../../shared/domain/logger';

interface TxJob {
  originTxHash: string;
  receiver: string;
  router: string;
  fromChain: string;
  toChain: string;
  dstToken: string;
  srcToken: string;
  minAmountOut: string;
}

export default class EventProcessor {
  private logger: Logger;
  private repository: TransactionsRepository;
  private transactionsProducer: Producer;

  constructor(producer: Producer, transactionsRepository: TransactionsRepository, logger: Logger) {
    this.repository = transactionsRepository;
    this.transactionsProducer = producer;
    this.logger = logger;
  }

  /**
   * Executed when a SwapExecuted event fires
   * @param event
   */
  public async swapExecuted(event: SwapExecuted) {
    // Create initial transaction
    await this.createTransaction(<CreateTransactionPayload>{
      txHash: event.txHash,
      walletAddress: event.wallet,
      routerAddress: event.routerAddress,
      fromChainId: event.chainId,
      toChainId: event.chainId,
      srcToken: event.srcToken,
      bridgeTokenIn: '',
      bridgeTokenOut: '',
      dstToken: event.dstToken,
      amountIn: event.amountIn,
    });

    // Update final amount
    await this.repository.update(<UpdateTransactionPayload>{
      txHash: event.txHash,
      amountOut: event.amountOut,
    });
  }

  /**
   * Executed when a CrossInitiated event fires
   * @param event
   */
  public async crossInitiated(event: CrossInitiated) {
    // Create initial transaction
    await this.createTransaction(<CreateTransactionPayload>{
      txHash: event.txHash,
      walletAddress: event.wallet,
      routerAddress: event.routerAddress,
      receiver: event.receiver,
      fromChainId: event.fromChain,
      toChainId: event.toChain,
      srcToken: event.srcToken,
      bridgeTokenIn: event.bridgeTokenIn,
      bridgeTokenOut: event.bridgeTokenOut,
      dstToken: event.dstToken,
      amountIn: event.amountIn,
    });

    // Update bridged amount
    await this.updateTransaction(<UpdateTransactionPayload>{
      txHash: event.txHash,
      bridgeAmountIn: event.amountCross,
    });

    await this.queueJob(<TxJob>{
      originTxHash: event.txHash,
      receiver: event.receiver,
      router: event.routerAddress,
      fromChain: event.fromChain,
      toChain: event.toChain,
      srcToken: event.bridgeTokenOut,
      dstToken: event.dstToken,
      minAmountOut: event.minAmountOut,
    });
  }

  /**
   * Executed when a CrossFinalized event fires
   * @param event
   */
  public async crossFinalized(event: CrossFinalized) {
    await this.updateTransaction(<UpdateTransactionPayload>{
      txHash: event.txHash,
      destinationTxHash: event.destinationTxHash,
      amountOut: event.amountOut,
      completed: event.completed,
    });
  }

  /**
   * Executed when a MultichainDelivered event fires
   * @param event
   */
  public async multichainDelivered(event: MultichainDelivered) {
    await this.updateTransaction({
      txHash: event.originTxHash,
      bridged: event.bridged,
      bridgeAmountOut: event.amountOut,
    });
  }

  /**
   * Queues a new job for the `transactions consumer`
   * @param job
   * @private
   */
  private async queueJob(job: TxJob): Promise<void> {
    await this.transactionsProducer.send({
      id: job.originTxHash,
      body: job.originTxHash,
      groupId: job.receiver,
      deduplicationId: job.originTxHash,
      messageAttributes: {
        txHash: { DataType: 'String', StringValue: job.originTxHash },
        receiver: { DataType: 'String', StringValue: job.receiver },
        fromChain: { DataType: 'String', StringValue: job.fromChain },
        toChain: { DataType: 'String', StringValue: job.toChain },
        srcToken: { DataType: 'String', StringValue: job.srcToken },
        dstToken: { DataType: 'String', StringValue: job.dstToken },
        router: { DataType: 'String', StringValue: job.router },
        minAmount: { DataType: 'String', StringValue: job.minAmountOut },
      },
    });
  }

  private createTransaction(payload: CreateTransactionPayload): Promise<void> {
    this.logger.log('Create transaction', payload);
    return this.repository.create(payload);
  }

  private updateTransaction(payload: UpdateTransactionPayload): Promise<void> {
    this.logger.log('Update transaction', payload);
    return this.repository.update(payload);
  }
}
