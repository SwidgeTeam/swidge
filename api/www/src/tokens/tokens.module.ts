import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import tokensRepositoryProvider from './infrastructure/database/repositories/tokens-repository-provider';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import coingeckoTokensPriceFetcherProvider from './infrastructure/external/coingecko-tokens-price-fetcher-provider';
import coingeckoCoinPriceFetcherProvider from './infrastructure/external/coingecko-coins-price-fetcher-provider';
import { AddImportedTokenController } from './infrastructure/controllers/add-imported-token-controller';
import { AddImportedTokenHandler } from './application/command/add-imported-token-handler';
import httpClientProvider from '../shared/infrastructure/http/httpClient.provider';
import coinmarketcapApiProvider from './infrastructure/external/coinmarketcap-api-provider';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';
import { GetWalletBalancesController } from './infrastructure/controllers/get-wallet-balances-controller';
import { GetWalletTokenListHandler } from './application/query/get-wallet-token-list-handler';
import walletBalancesRepositoryProvider from './infrastructure/external/wallet-balances-repository-provider';

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [
    AddImportedTokenController,
    GetWalletBalancesController,
  ],
  providers: [
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
