import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './shared/infrastructure/AuthGuard';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [new RegExp(process.env.APP_HOST_REGEX), 'localhost:3000'],
  });

  const guard = new AuthGuard(new ConfigService(), app.get(Reflector));
  app.useGlobalGuards(guard);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.APP_PORT || 80);
}

bootstrap();
