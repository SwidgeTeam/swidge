import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPathHandler } from './application/query/get-path.handler';
import { GetPathController } from './infrastructure/controllers/get-path.controller';
import { SwapsModule } from '../swaps/swaps.module';
import { GetSwapOrder } from '../swaps/application/query/get-swap-order';
import { BridgesModule } from '../bridges/bridges.module';
import { GetBridgingOrder } from '../bridges/application/query/get-bridging-order';
import httpClientProvider from '../shared/http/httpClient.provider';
import { AddressesModule } from '../addresses/addresses.module';
import addressesRepositoryProvider from '../addresses/infrastructure/database/repositories/addresses.repository.provider';
import { RouterAddressFetcher } from '../addresses/application/query/RouterAddressFetcher';
import { TransactionsModule } from '../transactions/transactions.module';
import tokenDetailsFetcherProvider from '../shared/infrastructure/TokenDetailsFetcher.provider';
import priceFeedConverterProvider from '../shared/infrastructure/PriceFeedConverter.provider';

@Module({
  imports: [
    CqrsModule,
    SwapsModule,
    BridgesModule,
    AddressesModule,
    TransactionsModule,
  ],
  controllers: [GetPathController],
  providers: [
    GetPathHandler,
    GetSwapOrder,
    GetBridgingOrder,
    RouterAddressFetcher,
    httpClientProvider(),
    addressesRepositoryProvider(),
    tokenDetailsFetcherProvider(),
    priceFeedConverterProvider(),
  ],
})
export class PathsModule {}
