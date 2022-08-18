import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import httpClientProvider from '../shared/infrastructure/http/httpClient.provider';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import { GetApprovalTxCalldataController } from './infrastructure/controllers/get-approval-tx-calldata-controller';
import { BuildTxApprovalHandler } from './application/query/build-tx-approval-handler';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { BuildTxHandler } from './application/query/build-tx-handler';
import { GetMainTxCalldataController } from './infrastructure/controllers/get-main-tx-calldata-controller';

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
  ],
  controllers: [
    GetApprovalTxCalldataController,
    GetMainTxCalldataController
  ],
  providers: [
    BuildTxApprovalHandler,
    BuildTxHandler,
    ConfigService,
    httpClientProvider(),
    consoleLoggerProvider(),
  ],
})
export class AggregatorsModule {}
