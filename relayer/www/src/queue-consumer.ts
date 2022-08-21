import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import TransactionsConsumer from './transactionsConsumer/application/transactions-consumer';

async function main() {
  const appModule = await NestFactory.createApplicationContext(AppModule);

  const consumer = appModule.get(TransactionsConsumer);

  await consumer.start();
}

main().catch((error) => {
  console.log(error);
  throw error;
});
