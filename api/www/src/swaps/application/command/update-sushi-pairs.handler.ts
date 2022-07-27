import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSushiPairsCommand } from './update-sushi-pairs.command';
import { SushiPairsRepository } from '../../domain/sushi-pairs-repository';
import { SushiPair } from '../../domain/sushi-pair';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { GraphPair, theGraphEndpoints } from '../../domain/providers/sushiswap';
import { Fantom, Polygon } from '../../../shared/enums/ChainIds';
import { Token } from '../../../shared/domain/Token';
import { ethers } from 'ethers';
import { randomUUID } from 'crypto';
import { SushiPairs } from '../../domain/sushi-pairs';

@CommandHandler(UpdateSushiPairsCommand)
export class UpdateSushiPairsHandler implements ICommandHandler<UpdateSushiPairsCommand> {
  constructor(
    @Inject(Class.SushiPairsRepository) private readonly repository: SushiPairsRepository,
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
  ) {}

  /**
   * Entrypoint
   */
  async execute(): Promise<void> {
    await this.updateExistingPairs();
    await this.updateTopVolumePairs();
  }

  /**
   * Updates the existing pairs
   * @private
   */
  private async updateExistingPairs(): Promise<void> {
    const pairs = await this.repository.getAllPairs();

    for (const pair of pairs.items<SushiPair[]>()) {
      await this.updateReserves(pair);
    }
  }

  /**
   * Fetches and updates the top volume pairs on all chains
   * @private
   */
  private async updateTopVolumePairs() {
    const chains = [Polygon, Fantom];
    for (const chain of chains) {
      const pairs = await this.fetchTopVolumePairs(chain);
      pairs.forEach((pair) => {
        this.repository.save(pair);
      });
    }
  }

  /**
   * Updates details of a specific pair
   * @param pair
   * @private
   */
  private async updateReserves(pair: SushiPair) {
    const updatedPair = await this.fetchUpdatedPair(pair);
    this.repository.save(updatedPair);
  }

  /**
   * Fetches the details of a specific pair
   * @param pair
   * @private
   */
  private async fetchUpdatedPair(pair: SushiPair) {
    const result = await this.httpClient.post<{
      data: {
        pairs: GraphPair[];
      };
    }>(theGraphEndpoints[pair.chainId], {
      query: `
        {
          pairs(
            where: {
              token0: "${pair.token0.address.toLowerCase()}"
              token1: "${pair.token1.address.toLowerCase()}"
            }
          ) {
            reserve0
            reserve1
          }
        }`,
    });

    const data = result.data.pairs[0];

    const reserve0 = BigInteger.fromDecimal(data.reserve0, pair.token0.decimals);
    const reserve1 = BigInteger.fromDecimal(data.reserve1, pair.token1.decimals);

    pair.updateReserve0(reserve0);
    pair.updateReserve1(reserve1);

    return pair;
  }

  /**
   * Fetches the details of the top volume pairs on a chain
   * @private
   * @param chainId
   */
  private async fetchTopVolumePairs(chainId: string): Promise<SushiPairs> {
    const result = await this.httpClient.post<{
      data: {
        pairs: GraphPair[];
      };
    }>(theGraphEndpoints[chainId], {
      query: `
        {
          pairs(
            orderBy: volumeUSD
            orderDirection: desc
            first: 10
          ) {
            token0 {
              id
              name
              symbol
              decimals
            }
            token1 {
              id
              name
              symbol
              decimals
            }
            reserve0
            reserve1
          }
        }`,
    });

    const items = [];

    for (const row of result.data.pairs) {
      const t0 = new Token(
        row.token0.name,
        ethers.utils.getAddress(row.token0.id),
        Number(row.token0.decimals),
        row.token0.symbol,
      );
      const t1 = new Token(
        row.token1.name,
        ethers.utils.getAddress(row.token1.id),
        Number(row.token1.decimals),
        row.token1.symbol,
      );

      const reserve0 = BigInteger.fromDecimal(row.reserve0, t0.decimals);
      const reserve1 = BigInteger.fromDecimal(row.reserve1, t1.decimals);

      items.push(new SushiPair(randomUUID(), chainId, t0, t1, reserve0, reserve1));
    }

    return new SushiPairs(items);
  }
}
