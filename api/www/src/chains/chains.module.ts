import { Module } from '@nestjs/common';
import { GetSupportedChainsController } from './infrastructure/controllers/get-supported-chains.controller';
import { GetSupportedChainsHandler } from './application';
import { CqrsModule } from '@nestjs/cqrs';
import { Class } from '../shared/Class';
import { ChainRepositoryMySQL } from './infrastructure/database/repositories/chains.repository';

@Module({
  imports: [CqrsModule],
  controllers: [GetSupportedChainsController],
  providers: [
    {
      provide: Class.ChainsRepository,
      useClass: ChainRepositoryMySQL,
    },
    GetSupportedChainsHandler,
  ],
})
export class ChainsModule {}
