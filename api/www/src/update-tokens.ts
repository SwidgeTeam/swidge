import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UpdateTokensDetails } from './tokens/application/command/update-tokens-details';

async function bootstrap() {
  const appModule = await NestFactory.createApplicationContext(AppModule);

  const updater = appModule.get(UpdateTokensDetails);

  await updater.execute();
}

bootstrap();
