import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPathHandler } from './application/query/get-path.handler';
import { GetPathController } from './infrastructure/controllers/get-path-controller';
import { TransactionsModule } from '../transactions/transactions.module';
import consoleLoggerProvider from '../shared/infrastructure/console-logger-provider';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    CqrsModule,
    TransactionsModule,
    ConfigModule,
  ],
  controllers: [GetPathController],
  providers: [
    GetPathHandler,
    ConfigService,
    consoleLoggerProvider(),
  ],
})
export class PathsModule {}
