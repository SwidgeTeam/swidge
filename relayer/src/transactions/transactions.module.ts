import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { RouterCaller } from './application/router-caller';
import transactionsRepositoryProvider from './infrastructure/repositories/transactions.repository.provider';
import httpClientProvider from '../shared/http/httpClient.provider';
import { ConfigService as NestJSConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { CustomLogger } from '../logger/CustomLogger';
import { SqsConsumer } from './application/sqs-consumer';
import { TransactionProcessor } from './application/transaction-processor';
import { MultichainTransactionFetcher } from './application/multichain-transaction-fetcher';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    SqsConsumer,
    RouterCaller,
    TransactionProcessor,
    MultichainTransactionFetcher,
    ConfigService,
    NestJSConfigService,
    CustomLogger,
    transactionsRepositoryProvider(),
    httpClientProvider(),
  ],
})
export class TransactionsModule {}
