import { Module } from '@nestjs/common';
import { SwapOrderComputer } from './application/query/swap-order-computer';
import httpClientProvider from '../shared/http/httpClient.provider';
import { GetSwapQuoteController } from './infrastructure/controllers/get-swap-quote.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { GetQuoteSwapHandler } from './application/query/get-quote-swap.handler';
import tokenDetailsFetcherProvider from '../shared/infrastructure/TokenDetailsFetcher.provider';
import cachedHttpClientProvider from '../shared/http/cachedHttpClient.provider';
import sushiPairsRepositoryProvider from './infrastructure/database/repositories/sushi-pairs.repository.provider';
import { UpdateSushiPairsController } from './infrastructure/controllers/update-sushi-pairs.controller';
import { UpdateSushiPairsHandler } from './application/command/update-sushi-pairs.handler';

@Module({
  imports: [CqrsModule],
  controllers: [GetSwapQuoteController, UpdateSushiPairsController],
  providers: [
    SwapOrderComputer,
    GetQuoteSwapHandler,
    UpdateSushiPairsHandler,
    httpClientProvider(),
    cachedHttpClientProvider(),
    tokenDetailsFetcherProvider(),
    sushiPairsRepositoryProvider(),
  ],
  exports: [SwapOrderComputer],
})
export class SwapsModule {}
