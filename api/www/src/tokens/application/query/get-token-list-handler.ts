import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTokenListQuery } from './get-token-list-query';
import { TokensRepository } from '../../domain/tokens.repository';
import { Class } from '../../../shared/Class';
import { TokenList } from '../../domain/TokenItem';

@QueryHandler(GetTokenListQuery)
export class GetTokenListHandler implements IQueryHandler<GetTokenListQuery> {
  constructor(@Inject(Class.TokensRepository) private readonly repository: TokensRepository) {}

  execute(): Promise<TokenList> {
    return this.repository.getList();
  }
}
