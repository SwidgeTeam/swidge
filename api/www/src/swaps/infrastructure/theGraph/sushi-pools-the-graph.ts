import { SushiPair } from '../../domain/sushi-pair';
import { BigInteger } from '../../../shared/domain/big-integer';
import { BSC, Fantom, Mainnet, Polygon } from '../../../shared/enums/ChainIds';
import { SushiPairs } from '../../domain/sushi-pairs';
import { Token as OwnToken } from '../../../shared/domain/token';
import { ethers } from 'ethers';
import { randomUUID } from 'crypto';
import { IHttpClient } from '../../../shared/domain/http/IHttpClient';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';

export interface GraphPair {
  name: string;
  token0: {
    id: string;
    name: string;
    decimals: string;
    symbol: string;
  };
  token1: {
    id: string;
    name: string;
    decimals: string;
    symbol: string;
  };
  reserve0: string;
  reserve1: string;
}

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
  constructor(@Inject(Class.HttpClient) private readonly httpClient: IHttpClient) {}

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
      items.push(this.buildPair(chainId, row));
    }

    return new SushiPairs(items);
  }

  /**
   * Fetches a pair given a chainId and two tokens
   * @param chainId
   * @param token0
   * @param token1
   */
  public async fetchPair(chainId: string, token0: string, token1: string) {
    const result = await this.httpClient.post<{
      data: {
        pairs: GraphPair[];
      };
    }>(theGraphEndpoints[chainId], {
      params: {
        query: `
        {
          pairs(
            where: {
              token0: "${token0}"
              token1: "${token1}"
            }
          ) {
            name
            token0 {
              id
              name
              decimals
              symbol
            }
            token1 {
              id
              name
              decimals
              symbol
            }
            reserve0
            reserve1
          }
        }`,
      },
    });

    const row = result.data.pairs[0];

    return this.buildPair(chainId, row);
  }

  /**
   * Fetches any existing pair that crosses any of the tokens on the list `tokens0`
   * with any of the tokens on the list `tokens1`
   * @param chainId Chain ID where we want to look
   * @param tokens0 Set of token addresses
   * @param tokens1 Set of token addresses
   * @return An object SushiPairs with the existing pairs, if any
   * @private
   */
  public async getPairsOf(
    chainId: string,
    tokens0: string[],
    tokens1: string[],
  ): Promise<SushiPairs> {
    let str_token0 = '',
      str_token1 = '';

    tokens0.forEach((token) => {
      str_token0 += '"' + token + '",';
    });
    tokens1.forEach((token) => {
      str_token1 += '"' + token + '",';
    });

    const result = await this.httpClient.post<{
      data: {
        pairs: GraphPair[];
      };
    }>(theGraphEndpoints[chainId], {
      params: {
        query: `
        {
          pairs(
            where: {
              token0_in: [
                ${str_token0}
              ]
              token1_in: [
                ${str_token1}
              ]
            }
          ) {
            token0 {
              id
              name
              decimals
              symbol
            }
            token1 {
              id
              name
              decimals
              symbol
            }
            reserve0
            reserve1
          }
        }`,
      },
    });

    const items = [];

    for (const row of result.data.pairs) {
      items.push(this.buildPair(chainId, row));
    }

    return new SushiPairs(items);
  }

  private buildPair(chainId: string, data: GraphPair): SushiPair {
    const t0 = new OwnToken(
      data.token0.name,
      ethers.utils.getAddress(data.token0.id),
      Number(data.token0.decimals),
      data.token0.symbol,
    );
    const t1 = new OwnToken(
      data.token1.name,
      ethers.utils.getAddress(data.token1.id),
      Number(data.token1.decimals),
      data.token1.symbol,
    );

    const reserve0 = BigInteger.fromDecimal(data.reserve0, t0.decimals);
    const reserve1 = BigInteger.fromDecimal(data.reserve1, t1.decimals);

    return new SushiPair(randomUUID(), chainId, t0, t1, reserve0, reserve1);
  }
}
