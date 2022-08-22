import { Module } from '@nestjs/common';
import { RouterListener } from './application/router-listener';
import { MultichainListener } from './application/multichain-listener';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ConfigService as NestJSConfigService } from '@nestjs/config';
import httpClientProvider from '../shared/http/httpClient.provider';
import addressesRepositoryProvider from '../persistence/infrastructure/addresses-repository.provider';
import consoleLoggerProvider from '../shared/infrastructure/console-logger.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    MultichainListener,
    RouterListener,
    ConfigService,
    NestJSConfigService,
    addressesRepositoryProvider(),
    httpClientProvider(),
    consoleLoggerProvider(),
  ],
})
export class EventsListenerModule {}
