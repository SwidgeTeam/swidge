import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as NestJSConfigModule } from '@nestjs/config';
import configuration from './configuration';

@Module({
  imports: [
    NestJSConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
