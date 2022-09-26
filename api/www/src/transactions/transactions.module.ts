import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import transactionRepositoryProvider from './infrastructure/database/repositories/transaction.repository.provider';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ConfigService as NestJSConfigService } from '@nestjs/config';
import { GetWalletTransactionsController } from './infrastructure/controllers/get-wallet-transactions-controller';
import { GetWalletTransactionsHandler } from './application/query/get-wallet-transactions-handler';
import { PostTxExecutedController } from './infrastructure/controllers/post-tx-executed-controller';
import { GetTxStatusController } from './infrastructure/controllers/get-tx-status-controller';
import { CheckTxStatusHandler } from './application/query/check-tx-status-handler';
import { ExecutedTxHandler } from './application/command/executed-tx-handler';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import { CheckPendingTxsController } from './infrastructure/controllers/check-pending-txs-controller';
import { CheckPendingTxsHandler } from './application/command/check-pending-txs-handler';

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [
    GetWalletTransactionsController,
    PostTxExecutedController,
    GetTxStatusController,
    CheckPendingTxsController,
  ],
  providers: [
    GetWalletTransactionsHandler,
    CheckPendingTxsHandler,
    CheckTxStatusHandler,
    ExecutedTxHandler,
    ConfigService,
    NestJSConfigService,
    transactionRepositoryProvider(),
    consoleLoggerProvider(),
  ],
})
export class TransactionsModule {}
