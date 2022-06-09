import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [new RegExp(process.env.APP_HOST_REGEX), 'localhost:3000'],
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.APP_PORT || 80);
}

bootstrap();
