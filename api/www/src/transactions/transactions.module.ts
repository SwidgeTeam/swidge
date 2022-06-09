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

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [
    GetTransactionController,
    PostTransactionController,
    PutTransactionController,
  ],
  providers: [
    GetTransactionHandler,
    CreateTransactionHandler,
    UpdateTransactionHandler,
    ConfigService,
    NestJSConfigService,
    transactionRepositoryProvider(),
  ],
})
export class TransactionsModule {}
