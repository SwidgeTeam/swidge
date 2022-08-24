import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UpdateTokensDetailsCoingecko } from './tokens/application/command/update-tokens-details-coingecko';

async function bootstrap() {
  const appModule = await NestFactory.createApplicationContext(AppModule);
  const updater = appModule.get(UpdateTokensDetailsCoingecko);
  await updater.execute();
}

bootstrap();
