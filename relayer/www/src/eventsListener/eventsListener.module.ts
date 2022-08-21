import { Module } from '@nestjs/common';
import { RouterListener } from './application/router-listener';
import { MultichainListener } from './application/multichain-listener';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ConfigService as NestJSConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { CustomLogger } from '../logger/CustomLogger';
import httpClientProvider from '../shared/http/httpClient.provider';
import addressesRepositoryProvider from '../persistence/infrastructure/addresses-repository.provider';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    MultichainListener,
    RouterListener,
    ConfigService,
    NestJSConfigService,
    CustomLogger,
    addressesRepositoryProvider(),
    httpClientProvider(),
  ],
})
export class EventListenerModule {}
