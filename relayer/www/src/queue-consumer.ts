import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './logger/CustomLogger';
import TransactionsConsumer from './transactionsConsumer/application/transactions-consumer';

async function main() {
  const appModule = await NestFactory.createApplicationContext(AppModule);

  appModule.useLogger(appModule.get(CustomLogger));

  const consumer = appModule.get(TransactionsConsumer);

  await consumer.start();
}

main().catch((error) => {
  console.log(error);
  throw error;
});
