import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import tokensRepositoryProvider from './infrastructure/database/repositories/tokens-repository-provider';

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [
    tokensRepositoryProvider()
  ],
})
export class TokensModule {}
