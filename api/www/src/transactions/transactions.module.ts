import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import transactionRepositoryProvider from './infrastructure/database/repositories/transaction.repository.provider';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ConfigService as NestJSConfigService } from '@nestjs/config';
import { GetWalletTransactionsController } from './infrastructure/controllers/get-wallet-transactions-controller';
import { GetWalletTransactionsHandler } from './application/query/get-wallet-transactions-handler';

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [
    GetWalletTransactionsController,
  ],
  providers: [
    GetWalletTransactionsHandler,
    ConfigService,
    NestJSConfigService,
    transactionRepositoryProvider(),
  ],
})
export class TransactionsModule {}
