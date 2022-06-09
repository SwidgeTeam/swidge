import { Module } from '@nestjs/common';
import { EventsListener } from './application/EventsListener';
import transactionsRepositoryProvider from '../transactions/infrastructure/repositories/transactions.repository.provider';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ConfigService as NestJSConfigService } from '@nestjs/config';
import httpClientProvider from '../shared/http/httpClient.provider';
import { LoggerModule } from '../logger/logger.module';
import { CustomLogger } from '../logger/CustomLogger';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    EventsListener,
    ConfigService,
    NestJSConfigService,
    CustomLogger,
    transactionsRepositoryProvider(),
    httpClientProvider(),
  ],
})
export class EventListenerModule {}
