import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import tokensRepositoryProvider from './infrastructure/database/repositories/tokens-repository-provider';
import { GetTokenListController } from './infrastructure/controllers/get-token-list-controller';
import { GetTokenListHandler } from './application/query/get-token-list-handler';
import { AddTokensController } from './infrastructure/controllers/add-tokens-controller';
import { AddTokensHandler } from './application/command/add-tokens-handler';
import { UpdateTokensDetailsCoingecko } from './application/command/update-tokens-details-coingecko';
import { UpdateTokensPriceController } from './infrastructure/controllers/update-tokens-price-controller';
import { UpdateTokensPriceHandler } from './application/command/update-tokens-price-handler';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import coingeckoTokensPriceFetcherProvider from './infrastructure/external/coingecko-tokens-price-fetcher-provider';
import coingeckoCoinPriceFetcherProvider from './infrastructure/external/coingecko-coins-price-fetcher-provider';
import { AddImportedTokenController } from './infrastructure/controllers/add-imported-token-controller';
import { AddImportedTokenHandler } from './application/command/add-imported-token-handler';
import httpClientProvider from '../shared/infrastructure/http/httpClient.provider';
import { UpdateTokensDetailsCmc } from './application/command/update-tokens-details-cmc';
import coinmarketcapApiProvider from './infrastructure/external/coinmarketcap-api-provider';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';
import { GetWalletBalancesController } from './infrastructure/controllers/get-wallet-balances-controller';
import { GetWalletTokenListHandler } from './application/query/get-wallet-token-list-handler';
import walletBalancesRepositoryProvider from './infrastructure/external/wallet-balances-repository-provider';

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [
    GetTokenListController,
    AddTokensController,
    UpdateTokensPriceController,
    AddImportedTokenController,
    GetWalletBalancesController,
  ],
  providers: [
    GetTokenListHandler,
    AddTokensHandler,
    UpdateTokensPriceHandler,
    UpdateTokensDetailsCoingecko,
    UpdateTokensDetailsCmc,
    AddImportedTokenHandler,
    GetWalletTokenListHandler,
    ConfigService,
    tokensRepositoryProvider(),
    coingeckoTokensPriceFetcherProvider(),
    coingeckoCoinPriceFetcherProvider(),
    coinmarketcapApiProvider(),
    consoleLoggerProvider(),
    httpClientProvider(),
    walletBalancesRepositoryProvider(),
  ],
})
export class TokensModule {}
