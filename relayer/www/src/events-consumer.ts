import { NestFactory } from '@nestjs/core';
import { EventsConsumerModule } from './eventsConsumer/eventsConsumer.module';
import EventsConsumer from './eventsConsumer/application/events-consumer';

async function main() {
  const service = await NestFactory.createApplicationContext(EventsConsumerModule);
  const listener = service.get(EventsConsumer);
  await listener.start();
}

main().catch((error) => {
  console.log(error);
  throw error;
});
