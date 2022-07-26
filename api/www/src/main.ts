import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './shared/infrastructure/AuthGuard';
import { ConfigService } from './config/config.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as swaggerStats from 'swagger-stats';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [new RegExp(process.env.APP_HOST_REGEX), 'localhost:3000'],
  });

  const config = new DocumentBuilder().build();
  const document = SwaggerModule.createDocument(app, config);

  app.use(
    swaggerStats.getMiddleware({
      uriPath: '/stats',
      swaggerSpec: document,
      authentication: true,
      onAuthenticate: function (req, username, password) {
        // simple check for username and password
        return username === process.env.SWAGGER_USER && password === process.env.SWAGGER_PASS;
      },
    }),
  );

  // we don't want to expose the API specs, but it's handy to have here
  //SwaggerModule.setup('api', app, document);

  const guard = new AuthGuard(new ConfigService(), app.get(Reflector));
  app.useGlobalGuards(guard);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.APP_PORT || 80);
}

bootstrap();
