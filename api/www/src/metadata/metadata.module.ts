import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import { GetMetadataController } from './infrastructure/controllers/get-metadata-controller';
import { GetMetadataHandler } from './application/query/get-metadata-handler';

@Module({
  imports: [CqrsModule],
  controllers: [GetMetadataController],
  providers: [GetMetadataHandler, consoleLoggerProvider()],
})
export class MetadataModule {}
