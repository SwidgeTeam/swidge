import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './logger/CustomLogger';
import { MultichainListener } from './eventListener/application/multichain-listener';

async function main() {
  const appModule = await NestFactory.createApplicationContext(AppModule);

  appModule.useLogger(appModule.get(CustomLogger));

  const listener = appModule.get(MultichainListener);

  await listener.execute();
}

main().catch((error) => {
  console.log(error);
  throw error;
});
