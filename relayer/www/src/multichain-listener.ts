import { NestFactory } from '@nestjs/core';
import { EventsListenerModule } from './eventsListener/eventsListener.module';
import { MultichainListener } from './eventsListener/application/multichain-listener';

async function main() {
  const service = await NestFactory.createApplicationContext(EventsListenerModule);
  const listener = service.get(MultichainListener);
  await listener.start();
}

main().catch((error) => {
  console.log(error);
  throw error;
});
