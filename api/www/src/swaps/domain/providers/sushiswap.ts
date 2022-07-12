import { SwapRequest } from '../SwapRequest';
import { SwapOrder } from '../SwapOrder';
import { Avalanche, BSC, Fantom, Mainnet, Polygon } from '../../../shared/enums/ChainIds';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { BigNumber, ethers } from 'ethers';
import { Exchange } from '../exchange';
import { HttpClient } from '../../../shared/http/httpClient';
import { ExchangeProviders } from './exchange-providers';
import { CurrencyAmount, JSBI, NATIVE, Pair, Token, Trade, WNATIVE } from '@sushiswap/sdk';

interface GraphPair {
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

const theGraphEndpoints = {
  [Mainnet]: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
  [BSC]: 'https://api.thegraph.com/subgraphs/name/sushiswap/bsc-exchange',
  [Polygon]: 'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange',
  [Fantom]: 'https://api.thegraph.com/subgraphs/name/sushiswap/fantom-exchange',
  //https://q.hg.network/okex-exchange/oec (okex)
  //https://thegraph.com/explorer/subgraph/sushiswap/xdai-exchange (xdai)
  //https://q.hg.network/heco-exchange/heco (heco)
  //https://thegraph.com/explorer/subgraph/sushiswap/arbitrum-exchange (arbitrum)
  //https://thegraph.com/explorer/subgraph/sushiswap/celo-exchange (celo)
  //https://thegraph.com/explorer/subgraph/sushiswap/avalanche-exchange (avalanche)
  //https://sushi.graph.t.hmny.io/subgraphs/name/sushiswap/harmony-exchange (harmony)
  //https://thegraph.com/hosted-service/subgraph/sushiswap/moonriver-exchange (moonriver)
};

export class Sushiswap implements Exchange {
  private readonly enabledChains: string[];

  public static create(httpClient: HttpClient) {
    return new Sushiswap(httpClient);
  }

  constructor(private readonly httpClient: HttpClient) {
    this.enabledChains = [Mainnet, Polygon, Fantom, BSC, Avalanche];
  }

  public isEnabledOn(chainId: string): boolean {
    return this.enabledChains.includes(chainId);
  }

  public async execute(request: SwapRequest): Promise<SwapOrder> {
    const chainId = Number(request.chainId);
    const pairs = await this.getPairs(chainId);

    const tokenIn = request.tokenIn.isNative()
      ? WNATIVE[chainId]
      : new Token(
          chainId,
          request.tokenIn.address,
          request.tokenIn.decimals,
          request.tokenIn.symbol,
          request.tokenIn.name,
        );

    const tokenInAmount = CurrencyAmount.fromRawAmount(
      tokenIn,
      JSBI.BigInt(request.amountIn.toString()),
    );

    const tokenOut = new Token(
      chainId,
      request.tokenOut.address,
      request.tokenOut.decimals,
      request.tokenOut.symbol,
      request.tokenOut.name,
    );

    const trade = Trade.bestTradeExactIn(pairs, tokenInAmount, tokenOut);

    if (trade.length === 0) {
      throw new Error('NO_PATH');
    }

    return new SwapOrder(
      ExchangeProviders.Sushi,
      request.tokenIn,
      request.tokenOut,
      '',
      '',
      BigInteger.fromBigNumber(trade[0].outputAmount.numerator.toString()),
      BigNumber.from('0'),
      true,
    );
  }

  private async getPairs(chainId: number): Promise<Pair[]> {
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
    });

    const pairs = [];

    for (const data of result.data.pairs) {
      const t0 = data.token0;
      const t1 = data.token1;
      const token0 = new Token(
        chainId,
        ethers.utils.getAddress(t0.id),
        Number(t0.decimals),
        t0.symbol,
        t0.name,
      );
      const token1 = new Token(
        chainId,
        ethers.utils.getAddress(t1.id),
        Number(t1.decimals),
        t1.symbol,
        t1.name,
      );

      const reserve0 = ethers.utils.parseUnits(data.reserve0, token0.decimals).toString();
      const reserve1 = ethers.utils.parseUnits(data.reserve1, token1.decimals).toString();

      const token0Amount = CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(reserve0));
      const token1Amount = CurrencyAmount.fromRawAmount(token1, JSBI.BigInt(reserve1));

      pairs.push(new Pair(token0Amount, token1Amount));
    }

    return pairs;
  }
}
