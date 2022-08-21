import { ConfigService } from '../../config/config.service';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { Consumer } from 'sqs-consumer';
import { SQS } from 'aws-sdk';
import https from 'https';
import http from 'http';
import EventConsumer from '../domain/event-consumer';
import { Producer } from 'sqs-producer';
import { TransactionsRepository } from '../../persistence/domain/transactions-repository';
import { Logger } from '../../shared/domain/logger';

export default class EventsConsumer {
  private consumer: EventConsumer;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.Logger) private readonly logger: Logger,
    @Inject(Class.TransactionsRepository) private readonly repository: TransactionsRepository,
  ) {
    const producer = this.createSqsProducer();
    this.consumer = new EventConsumer(producer, repository, logger);
  }

  /**
   * Starts a consumer of event's jobs
   */
  public async start() {
    const consumer = Consumer.create({
      queueUrl: this.configService.sqsEventsQueueUrl,
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
   * Creates the consumer for `events queue`
   * @private
   */
  private createSqsConsumer(): Consumer {
    return Consumer.create({
      queueUrl: this.configService.sqsEventsQueueUrl,
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
  }

  /**
   * Creates the producer for `transactions queue`
   * @private
   */
  private createSqsProducer(): Producer {
    return Producer.create({
      queueUrl: this.configService.sqsTransactionsQueueUrl,
      sqs: new SQS({
        region: this.configService.region,
        accessKeyId: this.configService.accessKey,
        secretAccessKey: this.configService.secret,
      }),
    });
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
