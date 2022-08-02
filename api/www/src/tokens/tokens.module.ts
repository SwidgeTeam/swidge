import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import tokensRepositoryProvider from './infrastructure/database/repositories/tokens-repository-provider';
import { GetTokenListController } from './infrastructure/controllers/get-token-list-controller';
import { GetTokenListHandler } from './application/query/get-token-list-handler';

@Module({
  imports: [CqrsModule],
  controllers: [
    GetTokenListController
  ],
  providers: [
    GetTokenListHandler,
    tokensRepositoryProvider()
  ],
})
export class TokensModule {}
