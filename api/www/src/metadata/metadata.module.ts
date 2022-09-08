import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import { GetMetadataController } from './infrastructure/controllers/get-metadata-controller';
import { GetMetadataHandler } from './application/query/get-metadata-handler';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [GetMetadataController],
  providers: [
    GetMetadataHandler,
    consoleLoggerProvider(),
  ],
})
export class MetadataModule {}
