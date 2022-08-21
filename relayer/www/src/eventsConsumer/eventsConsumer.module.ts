import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ConfigService as NestJSConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { CustomLogger } from '../logger/CustomLogger';
import EventsConsumer from './application/events-consumer';
import httpClientProvider from '../shared/http/httpClient.provider';
import transactionsRepositoryProvider from '../persistence/infrastructure/transactions-repository.provider';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    EventsConsumer,
    ConfigService,
    NestJSConfigService,
    CustomLogger,
    transactionsRepositoryProvider(),
    httpClientProvider(),
  ],
})
export class EventsConsumerModule {}
