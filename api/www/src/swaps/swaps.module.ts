import { Module } from '@nestjs/common';
import httpClientProvider from '../shared/infrastructure/http/httpClient.provider';
import { GetSwapQuoteController } from './infrastructure/controllers/get-swap-quote.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { GetQuoteSwapHandler } from './application/query/get-quote-swap.handler';
import tokenDetailsFetcherProvider from '../shared/infrastructure/TokenDetailsFetcher.provider';
import sushiPoolsTheGraphProvider from './infrastructure/theGraph/sushi-pools-the-graph.provider';

@Module({
  imports: [CqrsModule],
  controllers: [
    GetSwapQuoteController,
  ],
  providers: [
    GetQuoteSwapHandler,
    httpClientProvider(),
    tokenDetailsFetcherProvider(),
    sushiPoolsTheGraphProvider(),
  ],
})
export class SwapsModule {}
