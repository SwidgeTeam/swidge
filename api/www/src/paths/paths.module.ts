import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPathHandler } from './application/query/get-path.handler';
import { GetPathController } from './infrastructure/controllers/get-path-controller';
import httpClientProvider from '../shared/infrastructure/http/httpClient.provider';
import addressesRepositoryProvider from '../addresses/infrastructure/database/repositories/addresses.repository.provider';
import { TransactionsModule } from '../transactions/transactions.module';
import tokenDetailsFetcherProvider from '../shared/infrastructure/TokenDetailsFetcher.provider';
import cachedHttpClientProvider from '../shared/infrastructure/http/cachedHttpClient.provider';
import sushiPairsRepositoryProvider from '../swaps/infrastructure/database/repositories/sushi-pairs.repository.provider';
import priceFeedFetcherProvider from '../shared/infrastructure/PriceFeedFetcher.provider';
import gasPriceFetcherProvider from '../shared/infrastructure/gas-price-fetcher.provider';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    CqrsModule,
    TransactionsModule,
    ConfigModule,
  ],
  controllers: [GetPathController],
  providers: [
    GetPathHandler,
    ConfigService,
    httpClientProvider(),
    cachedHttpClientProvider(),
    addressesRepositoryProvider(),
    tokenDetailsFetcherProvider(),
    priceFeedFetcherProvider(),
    gasPriceFetcherProvider(),
    sushiPairsRepositoryProvider(),
    consoleLoggerProvider(),
  ],
})
export class PathsModule {}
