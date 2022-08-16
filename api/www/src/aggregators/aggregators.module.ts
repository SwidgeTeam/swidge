import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import httpClientProvider from '../shared/infrastructure/http/httpClient.provider';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import { GetTxApprovalCalldataController } from './infrastructure/controllers/get-tx-approval-calldata-controller';
import { BuildTxApprovalHandler } from './application/query/build-tx-approval-handler';

@Module({
  imports: [CqrsModule],
  controllers: [GetTxApprovalCalldataController],
  providers: [
    BuildTxApprovalHandler,
    httpClientProvider(),
    consoleLoggerProvider(),
  ],
})
export class AggregatorsModule {}
