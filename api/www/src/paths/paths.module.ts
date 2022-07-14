import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPathHandler } from './application/query/get-path.handler';
import { GetPathController } from './infrastructure/controllers/get-path.controller';
import { SwapsModule } from '../swaps/swaps.module';
import { SwapOrderComputer } from '../swaps/application/query/swap-order-computer';
import { BridgesModule } from '../bridges/bridges.module';
import { BridgeOrderComputer } from '../bridges/application/query/bridge-order-computer';
import httpClientProvider from '../shared/http/httpClient.provider';
import addressesRepositoryProvider from '../addresses/infrastructure/database/repositories/addresses.repository.provider';
import { TransactionsModule } from '../transactions/transactions.module';
import tokenDetailsFetcherProvider from '../shared/infrastructure/TokenDetailsFetcher.provider';
import priceFeedConverterProvider from '../shared/infrastructure/PriceFeedConverter.provider';
import cachedHttpClientProvider from '../shared/http/cachedHttpClient.provider';

@Module({
  imports: [
    CqrsModule,
    SwapsModule,
    BridgesModule,
    TransactionsModule,
  ],
  controllers: [GetPathController],
  providers: [
    GetPathHandler,
    SwapOrderComputer,
    BridgeOrderComputer,
    httpClientProvider(),
    cachedHttpClientProvider(),
    addressesRepositoryProvider(),
    tokenDetailsFetcherProvider(),
    priceFeedConverterProvider(),
  ],
})
export class PathsModule {}
