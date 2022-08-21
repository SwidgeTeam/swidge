import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MultichainListener } from './eventsListener/application/multichain-listener';

async function main() {
  const appModule = await NestFactory.createApplicationContext(AppModule);

  const listener = appModule.get(MultichainListener);

  await listener.start();
}

main().catch((error) => {
  console.log(error);
  throw error;
});
