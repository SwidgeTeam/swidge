import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import tokensRepositoryProvider from './infrastructure/database/repositories/tokens-repository-provider';
import { GetTokenListController } from './infrastructure/controllers/get-token-list-controller';
import { GetTokenListHandler } from './application/query/get-token-list-handler';
import { AddTokensController } from './infrastructure/controllers/add-tokens-controller';
import { AddTokensHandler } from './application/command/add-tokens-handler';
import { UpdateTokensDetails } from './application/command/update-tokens-details';
import { UpdateTokensPriceController } from './infrastructure/controllers/update-tokens-price-controller';
import { UpdateTokensPriceHandler } from './application/command/update-tokens-price-handler';
import coingeckoPriceFetcherProvider from './infrastructure/external/coingecko-price-fetcher.provider';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';

@Module({
  imports: [CqrsModule],
  controllers: [
    GetTokenListController,
    AddTokensController,
    UpdateTokensPriceController,
  ],
  providers: [
    GetTokenListHandler,
    AddTokensHandler,
    UpdateTokensPriceHandler,
    UpdateTokensDetails,
    tokensRepositoryProvider(),
    coingeckoPriceFetcherProvider(),
    consoleLoggerProvider(),
  ],
})
export class TokensModule {}
