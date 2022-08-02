import { TokensRepository } from '../../../domain/tokens.repository';
import { TokenListItem } from '../../../domain/TokenListItem';
import { EntityManager } from 'typeorm';
import { TokensEntity } from '../models/tokens.entity';
import { Injectable } from '@nestjs/common';
import { TokenList } from '../../../domain/TokenItem';

@Injectable()
export class TokensRepositoryMySQL implements TokensRepository {
  constructor(private readonly manager: EntityManager) {}

  async getList(): Promise<TokenList> {
    const tokens = await this.manager.find(TokensEntity);

    const items = tokens.map((token) => {
      return new TokenListItem(
        token.chainId,
        token.address,
        token.name,
        token.decimals,
        token.symbol,
        token.logo,
      );
    });

    return new TokenList(items);
  }
}
