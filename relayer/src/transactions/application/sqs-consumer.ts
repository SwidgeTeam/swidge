import { CustomLogger } from '../../logger/CustomLogger';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { TransactionsRepository } from '../domain/TransactionsRepository';
import * as https from 'https';
import { Consumer, SQSMessage } from 'sqs-consumer';
import { SQS } from 'aws-sdk';
import { ConfigService } from '../../config/config.service';
import { TransactionProcessor } from './transaction-processor';
import { MultichainTransactionFetcher } from './multichain-transaction-fetcher';
import { TransactionJob } from '../domain/TransactionJob';

export class SqsConsumer {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger,
    private readonly transactionProcessor: TransactionProcessor,
    private readonly multichainTransactionFetcher: MultichainTransactionFetcher,
    @Inject(Class.TransactionsRepository)
    private readonly repository: TransactionsRepository,
  ) {}

  /**
   * Starts a consumer of transaction jobs
   */
  public async start() {
    const consumer = Consumer.create({
      queueUrl: this.configService.sqsQueueUrl,
      messageAttributeNames: ['All'],
      handleMessage: async (message: SQSMessage) => {
        const txHash = message.MessageAttributes.txHash.StringValue;
        this.logger.log('Processing message w/ txHash ' + txHash);

        // Get details from Multichain API
        const multichainTx = await this.multichainTransactionFetcher.execute(
          txHash,
        );

        // If Multichain does not have details of this txHash, stop process
        if (multichainTx === null) {
          throw new Error('Multichain TX not yet indexed');
        }

        if (!multichainTx.isCompleted) {
          throw new Error('Multichain TX not yet completed');
        }

        // If tx is found, finish process
        const transactionJob: TransactionJob = {
          txHash: txHash,
          router: message.MessageAttributes.router.StringValue,
          srcToken: message.MessageAttributes.srcToken.StringValue,
          dstToken: message.MessageAttributes.dstToken.StringValue,
          toChainId: message.MessageAttributes.toChain.StringValue,
          walletAddress: message.MessageAttributes.wallet.StringValue,
          bridgeAmountOut: multichainTx.toValue,
        };
        await this.transactionProcessor.execute(transactionJob);
      },
      sqs: new SQS({
        region: this.configService.region,
        accessKeyId: this.configService.accessKey,
        secretAccessKey: this.configService.secret,
        httpOptions: {
          agent: new https.Agent({
            keepAlive: true,
          }),
        },
      }),
    });

    consumer.on('error', (err) => {
      this.logger.error(err);
    });

    consumer.on('processing_error', (err) => {
      this.logger.log('processing_error ', err.message);
    });

    consumer.on('message_processed', (msg) => {
      this.logger.log('message_processed ', msg);
    });

    consumer.start();
  }
}
