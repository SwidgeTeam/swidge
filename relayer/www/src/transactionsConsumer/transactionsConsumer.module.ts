import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ConfigService as NestJSConfigService } from '@nestjs/config';
import httpClientProvider from '../shared/http/httpClient.provider';
import TransactionsConsumer from './application/transactions-consumer';
import transactionsRepositoryProvider from '../persistence/infrastructure/transactions-repository.provider';
import consoleLoggerProvider from '../shared/infrastructure/console-logger.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    TransactionsConsumer,
    ConfigService,
    NestJSConfigService,
    transactionsRepositoryProvider(),
    httpClientProvider(),
    consoleLoggerProvider(),
  ],
})
export class TransactionsConsumerModule {}
