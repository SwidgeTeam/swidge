import { EntityManager, EntityRepository } from 'typeorm';
import { SushiPairsEntity } from '../models/sushi-pairs.entity';
import { SushiPairsRepository } from '../../../domain/sushi-pairs-repository';
import { CurrencyAmount, JSBI, Pair, Token } from '@sushiswap/sdk';
import { ethers } from 'ethers';

@EntityRepository(SushiPairsEntity)
export class SushiPairsRepositoryMysql implements SushiPairsRepository {
  constructor(private readonly manager: EntityManager) {}

  /**
   * Returns all the stored pairs of a specific chain
   * @param chainId
   */
  public async getPairs(chainId: string): Promise<Pair[]> {
    const result = await this.manager.find(SushiPairsEntity, {
      chainId: chainId,
    });

    return result.map((row) => {
      const token0 = new Token(
        Number(chainId),
        ethers.utils.getAddress(row.token0_id),
        Number(row.token0_decimals),
        row.token0_symbol,
        row.token0_name,
      );
      const token1 = new Token(
        Number(chainId),
        ethers.utils.getAddress(row.token1_id),
        Number(row.token1_decimals),
        row.token1_symbol,
        row.token1_name,
      );

      const reserve0 = ethers.utils.parseUnits(row.reserve0, token0.decimals).toString();
      const reserve1 = ethers.utils.parseUnits(row.reserve1, token1.decimals).toString();

      const token0Amount = CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(reserve0));
      const token1Amount = CurrencyAmount.fromRawAmount(token1, JSBI.BigInt(reserve1));

      return new Pair(token0Amount, token1Amount);
    });
  }
}
