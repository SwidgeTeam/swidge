import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { SushiPair } from '../../domain/sushi-pair';
import { GraphPair } from '../../domain/providers/sushiswap';
import { BigInteger } from '../../../shared/domain/big-integer';
import { BSC, Fantom, Mainnet, Polygon } from '../../../shared/enums/ChainIds';
import { SushiPairs } from '../../domain/sushi-pairs';
import { Token } from '../../../shared/domain/token';
import { ethers } from 'ethers';
import { randomUUID } from 'crypto';

export const theGraphEndpoints = {
  [Mainnet]: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
  [BSC]: 'https://api.thegraph.com/subgraphs/name/sushiswap/bsc-exchange',
  [Polygon]: 'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange',
  [Fantom]: 'https://api.thegraph.com/subgraphs/name/sushiswap/fantom-exchange',
  //https://thegraph.com/explorer/subgraph/sushiswap/xdai-exchange (xdai)
  //https://thegraph.com/explorer/subgraph/sushiswap/arbitrum-exchange (arbitrum)
  //https://thegraph.com/explorer/subgraph/sushiswap/celo-exchange (celo)
  //https://thegraph.com/explorer/subgraph/sushiswap/avalanche-exchange (avalanche)
  //https://thegraph.com/hosted-service/subgraph/sushiswap/moonriver-exchange (moonriver)
};

export class SushiPoolsTheGraph {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Fetches the details of a specific pair
   * @param pair
   * @private
   */
  public async fetchUpdatedPair(pair: SushiPair) {
    const result = await this.httpClient.post<{
      data: {
        pairs: GraphPair[];
      };
    }>(theGraphEndpoints[pair.chainId], {
      params: {
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
      },
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
  public async fetchTopVolumePairs(chainId: string): Promise<SushiPairs> {
    const result = await this.httpClient.post<{
      data: {
        pairs: GraphPair[];
      };
    }>(theGraphEndpoints[chainId], {
      params: {
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
      },
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