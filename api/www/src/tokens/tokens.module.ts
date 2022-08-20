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
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import coingeckoTokensPriceFetcherProvider from './infrastructure/external/coingecko-tokens-price-fetcher-provider';
import coingeckoCoinPriceFetcherProvider from './infrastructure/external/coingecko-coins-price-fetcher-provider';
import { AddImportedTokenController } from './infrastructure/controllers/add-imported-token-controller';
import { AddImportedTokenHandler } from './application/command/add-imported-token-handler';

@Module({
  imports: [CqrsModule],
  controllers: [
    GetTokenListController,
    AddTokensController,
    UpdateTokensPriceController,
    AddImportedTokenController,
  ],
  providers: [
    GetTokenListHandler,
    AddTokensHandler,
    UpdateTokensPriceHandler,
    UpdateTokensDetails,
    AddImportedTokenHandler,
    tokensRepositoryProvider(),
    coingeckoTokensPriceFetcherProvider(),
    coingeckoCoinPriceFetcherProvider(),
    consoleLoggerProvider(),
  ],
})
export class TokensModule {}
