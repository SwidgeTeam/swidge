import { EntityManager, EntityRepository, LessThan } from 'typeorm';
import { SushiPairsEntity } from '../models/sushi-pairs.entity';
import { SushiPairsRepository } from '../../../domain/sushi-pairs-repository';
import { ethers } from 'ethers';
import { Token } from '../../../../shared/domain/Token';
import { BigInteger } from '../../../../shared/domain/BigInteger';
import { SushiPair } from '../../../domain/sushi-pair';
import { SushiPairs } from '../../../domain/sushi-pairs';

@EntityRepository(SushiPairsEntity)
export class SushiPairsRepositoryMysql implements SushiPairsRepository {
  constructor(private readonly manager: EntityManager) {}

  /**
   * Returns all the stored pairs of a specific chain
   * @param chainId
   */
  public async getPairs(chainId: string): Promise<SushiPairs> {
    const result = await this.manager.find(SushiPairsEntity, {
      chainId: chainId,
    });
    return this.constructPairs(result);
  }

  /**
   * Returns all the stored pairs
   */
  public async getOutdatedPairs(): Promise<SushiPairs> {
    const oneMinuteAgo = new Date(Date.now() - 1000 * 60);
    const result = await this.manager.find(SushiPairsEntity, {
      where: [
        { updated: null },
        { updated: LessThan(oneMinuteAgo) }
      ],
    });
    return this.constructPairs(result);
  }

  /**
   * Build pairs from database response
   * @param result
   * @private
   */
  private constructPairs(result) {
    const items = result.map((row) => {
      const token0 = new Token(
        row.token0_name,
        ethers.utils.getAddress(row.token0_id),
        Number(row.token0_decimals),
        row.token0_symbol,
      );
      const token1 = new Token(
        row.token1_name,
        ethers.utils.getAddress(row.token1_id),
        Number(row.token1_decimals),
        row.token1_symbol,
      );

      const reserve0 = BigInteger.fromString(row.reserve0);
      const reserve1 = BigInteger.fromString(row.reserve1);

      return new SushiPair(row.id, row.chainId, token0, token1, reserve0, reserve1);
    });
    return new SushiPairs(items);
  }

  /**
   * Saves the given pair
   * @param pair
   */
  async save(pair: SushiPair): Promise<void> {
    const [, count] = await this.manager.findAndCount(SushiPairsEntity, {
      where: {
        chainId: pair.chainId,
        token0_id: pair.token0.address,
        token1_id: pair.token1.address,
      },
    });

    if (count > 0) {
      await this.update(pair);
    } else {
      await this.insert(pair);
    }
  }

  /**
   * Creates a new pair
   * @param pair
   */
  private async insert(pair: SushiPair): Promise<void> {
    await this.manager.save(SushiPairsEntity, {
      id: pair.id,
      chainId: pair.chainId,
      token0_id: pair.token0.address,
      token0_name: pair.token0.name,
      token0_symbol: pair.token0.symbol,
      token0_decimals: pair.token0.decimals,
      token1_id: pair.token1.address,
      token1_name: pair.token1.name,
      token1_symbol: pair.token1.symbol,
      token1_decimals: pair.token1.decimals,
      reserve0: pair.reserve0.toString(),
      reserve1: pair.reserve1.toString(),
      updated: new Date(),
    });
  }

  /**
   * Updates the reserves on the pair
   * @param pair
   */
  private async update(pair: SushiPair): Promise<void> {
    await this.manager.update(
      SushiPairsEntity,
      {
        chainId: pair.chainId,
        token0_id: pair.token0.address,
        token1_id: pair.token1.address,
      },
      {
        reserve0: pair.reserve0.toString(),
        reserve1: pair.reserve1.toString(),
        updated: new Date(),
      },
    );
  }
}
