import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RouterListener } from './eventsListener/application/router-listener';
import { CustomLogger } from './logger/CustomLogger';

async function main() {
  const appModule = await NestFactory.createApplicationContext(AppModule);

  appModule.useLogger(appModule.get(CustomLogger));

  const listener = appModule.get(RouterListener);

  await listener.start();
}

main().catch((error) => {
  console.log(error);
  throw error;
});
