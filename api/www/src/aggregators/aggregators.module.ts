import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import httpClientProvider from '../shared/infrastructure/http/httpClient.provider';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import { GetApprovalTxCalldataController } from './infrastructure/controllers/get-approval-tx-calldata-controller';
import { BuildTxApprovalHandler } from './application/query/build-tx-approval-handler';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { BuildMainTxHandler } from './application/query/build-main-tx-handler';
import { GetMainTxCalldataController } from './infrastructure/controllers/get-main-tx-calldata-controller';
import gasPriceFetcherProvider from '../shared/infrastructure/gas-price-fetcher.provider';
import priceFeedFetcherProvider from '../shared/infrastructure/price-feed-fetcher.provider';
import { GetTxStatusController } from '../transactions/infrastructure/controllers/get-tx-status-controller';
import { CheckTxStatusHandler } from '../transactions/application/query/check-tx-status-handler';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
  ],
  controllers: [
    GetApprovalTxCalldataController,
    GetMainTxCalldataController,
    GetTxStatusController,
  ],
  providers: [
    BuildTxApprovalHandler,
    BuildMainTxHandler,
    ConfigService,
    CheckTxStatusHandler,
    httpClientProvider(),
    gasPriceFetcherProvider(),
    priceFeedFetcherProvider(),
    consoleLoggerProvider(),
  ],
})
export class AggregatorsModule {}
