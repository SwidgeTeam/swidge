import { Module } from '@nestjs/common';
import { TransactionsModule } from './transactions/transactions.module';
import { EventListenerModule } from './eventListener/eventListener.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    TransactionsModule,
    EventListenerModule,
    LoggerModule,
  ],
})
export class AppModule {}
