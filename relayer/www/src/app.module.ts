import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { TransactionsConsumerModule } from './transactionsConsumer/transactionsConsumer.module';
import { EventsConsumerModule } from './eventsConsumer/eventsConsumer.module';
import { EventsListenerModule } from './eventsListener/eventsListener.module';

@Module({
  imports: [
    EventsListenerModule,
    EventsConsumerModule,
    TransactionsConsumerModule,
    LoggerModule,
  ],
})
export class AppModule {}
