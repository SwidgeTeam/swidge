import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPathHandler } from './application/query/get-path.handler';
import { GetPathController } from './infrastructure/controllers/get-path-controller';
import { SwapsModule } from '../swaps/swaps.module';
import { SwapOrderComputer } from '../swaps/application/query/swap-order-computer';
import httpClientProvider from '../shared/infrastructure/http/httpClient.provider';
import addressesRepositoryProvider from '../addresses/infrastructure/database/repositories/addresses.repository.provider';
import { TransactionsModule } from '../transactions/transactions.module';
import tokenDetailsFetcherProvider from '../shared/infrastructure/TokenDetailsFetcher.provider';
import cachedHttpClientProvider from '../shared/infrastructure/http/cachedHttpClient.provider';
import sushiPairsRepositoryProvider from '../swaps/infrastructure/database/repositories/sushi-pairs.repository.provider';
import priceFeedFetcherProvider from '../shared/infrastructure/PriceFeedFetcher.provider';
import gasPriceFetcherProvider from '../shared/infrastructure/GasPriceFetcher.provider';

@Module({
  imports: [
    CqrsModule,
    SwapsModule,
    TransactionsModule,
  ],
  controllers: [GetPathController],
  providers: [
    GetPathHandler,
    SwapOrderComputer,
    httpClientProvider(),
    cachedHttpClientProvider(),
    addressesRepositoryProvider(),
    tokenDetailsFetcherProvider(),
    priceFeedFetcherProvider(),
    gasPriceFetcherProvider(),
    sushiPairsRepositoryProvider(),
  ],
})
export class PathsModule {}
