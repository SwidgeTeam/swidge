import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateTransactionHandler } from './application/command/create-transaction.handler';
import transactionRepositoryProvider from './infrastructure/database/repositories/transaction.repository.provider';
import { PostTransactionController } from './infrastructure/controllers/post-transaction.controller';
import { GetTransactionController } from './infrastructure/controllers/get-transaction.controller';
import { GetTransactionHandler } from './application/query/get-transaction.handler';
import { UpdateTransactionHandler } from './application/command/update-transaction.handler';
import { PutTransactionController } from './infrastructure/controllers/put-transaction.controller';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ConfigService as NestJSConfigService } from '@nestjs/config';
import { GetWalletTransactionsController } from './infrastructure/controllers/get-wallet-transactions-controller';
import { GetWalletTransactionsHandler } from './application/query/get-wallet-transactions-handler';

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [
    GetTransactionController,
    PostTransactionController,
    PutTransactionController,
    GetWalletTransactionsController,
  ],
  providers: [
    GetTransactionHandler,
    CreateTransactionHandler,
    UpdateTransactionHandler,
    GetWalletTransactionsHandler,
    ConfigService,
    NestJSConfigService,
    transactionRepositoryProvider(),
  ],
})
export class TransactionsModule {}
