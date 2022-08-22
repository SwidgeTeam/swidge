import { NestFactory } from '@nestjs/core';
import { TransactionsConsumerModule } from './transactionsConsumer/transactionsConsumer.module';
import TransactionsConsumer from './transactionsConsumer/application/transactions-consumer';

async function main() {
  const service = await NestFactory.createApplicationContext(TransactionsConsumerModule);
  const listener = service.get(TransactionsConsumer);
  await listener.start();
}

main().catch((error) => {
  console.log(error);
  throw error;
});
