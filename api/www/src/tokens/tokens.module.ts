import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import tokensRepositoryProvider from './infrastructure/database/repositories/tokens-repository-provider';
import { GetTokenListController } from './infrastructure/controllers/get-token-list-controller';
import { GetTokenListHandler } from './application/query/get-token-list-handler';
import { AddTokensController } from './infrastructure/controllers/add-tokens-controller';
import { AddTokensHandler } from './application/command/add-tokens-handler';

@Module({
  imports: [CqrsModule],
  controllers: [
    GetTokenListController,
    AddTokensController,
  ],
  providers: [
    GetTokenListHandler,
    AddTokensHandler,
    tokensRepositoryProvider()
  ],
})
export class TokensModule {}
