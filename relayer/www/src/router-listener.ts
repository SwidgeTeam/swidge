import { NestFactory } from '@nestjs/core';
import { RouterListener } from './eventsListener/application/router-listener';
import { EventsListenerModule } from './eventsListener/eventsListener.module';

async function main() {
  const service = await NestFactory.createApplicationContext(EventsListenerModule);
  const listener = service.get(RouterListener);
  await listener.start();
}

main().catch((error) => {
  console.log(error);
  throw error;
});
