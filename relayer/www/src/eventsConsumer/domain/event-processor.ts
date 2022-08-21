import { CrossFinalized, CrossInitiated, MultichainDelivered, SwapExecuted } from './event-types';
import { Producer } from 'sqs-producer';
import {
  CreateTransactionPayload,
  TransactionsRepository,
  UpdateTransactionPayload,
} from '../../persistence/domain/transactions-repository';
import { Logger } from '../../shared/domain/logger';

interface TxJob {
  txHash: string;
  wallet: string;
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
    this.logger = logger;
    this.repository = transactionsRepository;
    this.transactionsProducer = producer;
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
    await this.updateTransaction(<UpdateTransactionPayload>{
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
      txHash: event.txHash,
      wallet: event.receiver,
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
   * @param tx
   * @private
   */
  private async queueJob(tx: TxJob): Promise<void> {
    await this.transactionsProducer.send({
      id: tx.txHash,
      body: tx.txHash,
      groupId: tx.wallet,
      deduplicationId: tx.txHash,
      messageAttributes: {
        txHash: { DataType: 'String', StringValue: tx.txHash },
        wallet: { DataType: 'String', StringValue: tx.wallet },
        fromChain: { DataType: 'String', StringValue: tx.fromChain },
        toChain: { DataType: 'String', StringValue: tx.toChain },
        srcToken: { DataType: 'String', StringValue: tx.srcToken },
        dstToken: { DataType: 'String', StringValue: tx.dstToken },
        router: { DataType: 'String', StringValue: tx.router },
        minAmount: { DataType: 'String', StringValue: tx.minAmountOut },
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
