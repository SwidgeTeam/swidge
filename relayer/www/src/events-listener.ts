import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventsListener } from './eventListener/application/EventsListener';
import { CustomLogger } from './logger/CustomLogger';

async function main() {
  const appModule = await NestFactory.createApplicationContext(AppModule);

  appModule.useLogger(appModule.get(CustomLogger));

  const listener = appModule.get(EventsListener);

  await listener.execute();
}

main();
