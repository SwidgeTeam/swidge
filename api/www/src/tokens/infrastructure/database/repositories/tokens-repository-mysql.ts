import { TokensRepository } from '../../../domain/tokens.repository';
import { TokenListItem } from '../../../domain/TokenListItem';
import { EntityManager, LessThan } from 'typeorm';
import { TokensEntity } from '../models/tokens.entity';
import { Injectable } from '@nestjs/common';
import { TokenList } from '../../../domain/TokenItem';

@Injectable()
export class TokensRepositoryMySQL implements TokensRepository {
  constructor(private readonly manager: EntityManager) {}

  /**
   * Returns the whole list of tokens
   */
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
        token.externalId,
        token.price,
      );
    });

    return new TokenList(items);
  }

  /**
   * Searches a token given the chainId and address
   * @param chainId
   * @param address
   * @return The token or null if not found
   */
  async find(chainId: string, address: string): Promise<TokenListItem | null> {
    const token = await this.manager.findOne(TokensEntity, {
      chainId: chainId,
      address: address,
    });

    if (!token) {
      return null;
    }

    return new TokenListItem(
      token.chainId,
      token.address,
      token.name,
      token.decimals,
      token.symbol,
      token.logo,
      token.externalId,
      token.price,
    );
  }

  /**
   * Saves a new token
   * @param token
   */
  async save(token: TokenListItem): Promise<void> {
    await this.manager.save(TokensEntity, {
      chainId: token.chainId,
      address: token.address,
      name: token.name,
      decimals: token.decimals,
      symbol: token.symbol,
      logo: token.logoURL,
    });
  }

  /**
   * Fetches the more outdated `amount` of tokens
   * @param minutes Minimum amount of number to consider token outdated
   * @param amount Amount of tokens to return
   */
  async getOutdatedTokens(minutes: number, amount: number): Promise<TokenList> {
    const deadline = new Date(Date.now() - 1000 * 60 * minutes);
    const tokens = await this.manager.find(TokensEntity, {
      where: [
        { updated: null },
        { updated: LessThan(deadline) }
      ],
      order: {
        updated: 'ASC',
      },
      take: amount,
    });

    const items = tokens.map((token) => {
      return new TokenListItem(
        token.chainId,
        token.address,
        token.name,
        token.decimals,
        token.symbol,
        token.logo,
        token.externalId,
        token.price,
      );
    });

    return new TokenList(items);
  }
}
