import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RouterListener } from './eventsListener/application/router-listener';

async function main() {
  const appModule = await NestFactory.createApplicationContext(AppModule);

  const listener = appModule.get(RouterListener);

  await listener.start();
}

main().catch((error) => {
  console.log(error);
  throw error;
});
