import { NestFactory } from '@nestjs/core';
import { UpdateTokensDetailsCmc } from './tokens/application/command/update-tokens-details-cmc';
import { AppModule } from './app.module';

async function bootstrap() {
  const appModule = await NestFactory.createApplicationContext(AppModule);
  const updater = await appModule.get(UpdateTokensDetailsCmc);
  await updater.execute();
}

bootstrap();
