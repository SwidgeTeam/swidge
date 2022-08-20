import {
  CreateTransactionPayload,
  TransactionsRepository,
  UpdateTransactionPayload,
} from '../../transactions/domain/TransactionsRepository';
import { ConfigService } from '../../config/config.service';
import { CustomLogger } from '../../logger/CustomLogger';
import { CrossFinalized, CrossInitiated, SwapExecuted } from './event-types';
import { Producer } from 'sqs-producer';
import { SQS } from 'aws-sdk';

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
  private configService: ConfigService;
  private logger: CustomLogger;
  private transactionsRepository: TransactionsRepository;

  constructor(
    configService: ConfigService,
    logger: CustomLogger,
    transactionsRepository: TransactionsRepository,
  ) {
    this.configService = configService;
    this.logger = logger;
    this.transactionsRepository = transactionsRepository;
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

  private async queueJob(tx: TxJob): Promise<void> {
    const producer = Producer.create({
      queueUrl: this.configService.sqsQueueUrl,
      sqs: new SQS({
        region: this.configService.region,
        accessKeyId: this.configService.accessKey,
        secretAccessKey: this.configService.secret,
      }),
    });

    await producer.send({
      id: tx.txHash,
      body: tx.txHash,
      groupId: tx.wallet,
      deduplicationId: tx.wallet,
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
    return this.transactionsRepository.create(payload);
  }

  private updateTransaction(payload: UpdateTransactionPayload): Promise<void> {
    this.logger.log('Update transaction', payload);
    return this.transactionsRepository.update(payload);
  }
}
