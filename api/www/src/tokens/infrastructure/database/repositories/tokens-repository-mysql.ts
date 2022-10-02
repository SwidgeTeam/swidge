import { TokensRepository } from '../../../domain/tokens.repository';
import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ImportedTokensEntity } from '../models/imported-tokens.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class TokensRepositoryMySQL implements TokensRepository {
  constructor(private readonly manager: EntityManager) {}

  async addImported(chainId: string, address: string, wallet: string): Promise<void> {
    await this.manager.save(ImportedTokensEntity, {
      uuid: randomUUID(),
      chainId: chainId,
      address: address,
      wallet: wallet,
      added: new Date(),
    });
  }
}
