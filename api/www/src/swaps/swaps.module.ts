import { Module } from '@nestjs/common';
import { SwapOrderComputer } from './application/query/swap-order-computer';
import httpClientProvider from '../shared/http/httpClient.provider';
import { GetSwapQuoteController } from './infrastructure/controllers/get-swap-quote.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { GetQuoteSwapHandler } from './application/query/get-quote-swap.handler';
import tokenDetailsFetcherProvider from '../shared/infrastructure/TokenDetailsFetcher.provider';

@Module({
  imports: [CqrsModule],
  controllers: [GetSwapQuoteController],
  providers: [
    SwapOrderComputer,
    GetQuoteSwapHandler,
    httpClientProvider(),
    tokenDetailsFetcherProvider(),
  ],
  exports: [SwapOrderComputer],
})
export class SwapsModule {}
