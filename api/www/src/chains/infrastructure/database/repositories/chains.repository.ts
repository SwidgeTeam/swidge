import { ChainRepository } from '../../../domain/chain.repository';
import { Chain } from '../../../domain/Chain';
import { EntityManager } from 'typeorm';
import { ChainEntity } from '../models/chain.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChainRepositoryMySQL implements ChainRepository {
  constructor(private readonly manager: EntityManager) {}

  async getSupported(): Promise<Chain[]> {
    const chains = await this.manager
      .createQueryBuilder(ChainEntity, 'chain')
      .getMany();

    return chains.map((chain) => {
      return new Chain(chain.id, chain.name, chain.chainId);
    });
  }
}
