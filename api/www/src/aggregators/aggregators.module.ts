import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { BuildMainTxHandler } from './application/query/build-main-tx-handler';
import { GetMainTxCalldataController } from './infrastructure/controllers/get-main-tx-calldata-controller';
import gasPriceFetcherProvider from '../shared/infrastructure/gas-price-fetcher.provider';
import priceFeedFetcherProvider from '../shared/infrastructure/price-feed-fetcher.provider';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
  ],
  controllers: [
    GetMainTxCalldataController,
  ],
  providers: [
    BuildMainTxHandler,
    ConfigService,
    gasPriceFetcherProvider(),
    priceFeedFetcherProvider(),
    consoleLoggerProvider(),
  ],
})
export class AggregatorsModule {}
