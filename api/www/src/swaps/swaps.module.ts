import { Module } from '@nestjs/common';
import { GetSwapOrder } from './application/query/get-swap-order';
import httpClientProvider from '../shared/http/httpClient.provider';
import { GetSwapQuoteController } from './infrastructure/controllers/get-swap-quote.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { GetQuoteSwapHandler } from './application/query/get-quote-swap.handler';
import tokenDetailsFetcherProvider from '../shared/infrastructure/TokenDetailsFetcher.provider';

@Module({
  imports: [CqrsModule],
  controllers: [GetSwapQuoteController],
  providers: [
    GetSwapOrder,
    GetQuoteSwapHandler,
    httpClientProvider(),
    tokenDetailsFetcherProvider(),
  ],
  exports: [GetSwapOrder],
})
export class SwapsModule {}
