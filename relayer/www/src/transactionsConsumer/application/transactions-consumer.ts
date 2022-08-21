import { ConfigService } from '../../config/config.service';
import { CustomLogger } from '../../logger/CustomLogger';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { TransactionsRepository } from '../../transactions/domain/TransactionsRepository';
import { Consumer } from 'sqs-consumer';
import { SQS } from 'aws-sdk';
import https from 'https';
import http from 'http';
import TransactionConsumer from '../domain/transaction-consumer';
import { RouterCaller } from '../infrastructure/router-caller';

export default class TransactionsConsumer {
  private consumer: TransactionConsumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger,
    @Inject(Class.TransactionsRepository) private readonly repository: TransactionsRepository,
  ) {
    const routerCaller = new RouterCaller(configService, logger);
    this.consumer = new TransactionConsumer(routerCaller, repository, logger);
  }

  /**
   * Starts a consumer of event's jobs
   */
  public async start() {
    const consumer = Consumer.create({
      queueUrl: this.configService.sqsTransactionsQueueUrl,
      messageAttributeNames: ['All'],
      handleMessage: this.consumer.process,
      sqs: new SQS({
        region: this.configService.region,
        accessKeyId: this.configService.accessKey,
        secretAccessKey: this.configService.secret,
        httpOptions: {
          agent: this.getAgent(),
        },
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    consumer.on('error', (err) => {
      self.logger.error(err);
    });

    consumer.on('processing_error', (err) => {
      self.logger.log('processing_error ', err.message);
    });

    consumer.on('message_processed', (msg) => {
      self.logger.log('message_processed ', msg);
    });

    consumer.start();
  }

  /**
   * Creates the agent config for consumer
   * @private
   */
  private getAgent() {
    if (this.configService.isProduction) {
      return new https.Agent({
        keepAlive: true,
      });
    }
    return new http.Agent({
      keepAlive: true,
    });
  }
}
