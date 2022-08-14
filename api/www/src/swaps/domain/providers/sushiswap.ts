import { SwapRequest } from '../swap-request';
import { SwapOrder } from '../swap-order';
import { BSC, Fantom, Mainnet, Polygon } from '../../../shared/enums/ChainIds';
import { BigInteger } from '../../../shared/domain/big-integer';
import { ethers } from 'ethers';
import { Exchange } from '../exchange';
import { IHttpClient } from '../../../shared/domain/http/IHttpClient';
import { ExchangeProviders } from './exchange-providers';
import {
  CurrencyAmount,
  JSBI,
  NATIVE,
  Pair,
  Percent,
  Router,
  SwapParameters,
  Token,
  Trade,
  TradeType,
} from '@sushiswap/sdk';
import { SushiPairsRepository } from '../sushi-pairs-repository';
import { AbiEncoder } from '../../../shared/domain/call-encoder';
import { DeployedAddresses } from '../../../shared/DeployedAddresses';
import { SushiPairs } from '../sushi-pairs';
import { SushiPair } from '../sushi-pair';
import { randomUUID } from 'crypto';
import { Token as OwnToken } from '../../../shared/domain/token';
import { TokenAddresses } from '../../../shared/enums/TokenAddresses';
import { InsufficientLiquidity } from '../insufficient-liquidity';

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

const gasEstimations = {
  [Polygon]: 150000,
  [Fantom]: 150000,
};

export class Sushiswap implements Exchange {
  private readonly enabledChains: string[];

  constructor(
    private readonly httpClient: IHttpClient,
    private readonly repository: SushiPairsRepository,
  ) {
    this.enabledChains = [Polygon, Fantom];
  }

  public isEnabledOn(chainId: string): boolean {
    return this.enabledChains.includes(chainId);
  }

  /**
   * Entrypoint
   * @param request
   * @return The best possible path given the request
   * @throws Exception if no path is found
   */
  public async execute(request: SwapRequest): Promise<SwapOrder> {
    const chainId = Number(request.chainId);
    let sushiPairs = await this.repository.getPairs(request.chainId);

    if (!sushiPairs.contains(request.tokenIn)) {
      const extraPairs = await this.getExtraPairs(request.chainId, request.tokenIn);
      sushiPairs = sushiPairs.add(extraPairs);
    }
    if (!sushiPairs.contains(request.tokenOut)) {
      const extraPairs = await this.getExtraPairs(request.chainId, request.tokenOut);
      sushiPairs = sushiPairs.add(extraPairs);
    }

    const pairs = this.convertToNativePairs(sushiPairs);

    const tokenIn = request.tokenIn.isNative()
      ? NATIVE[chainId]
      : new Token(
          chainId,
          ethers.utils.getAddress(request.tokenIn.address),
          request.tokenIn.decimals,
          request.tokenIn.symbol,
          request.tokenIn.name,
        );

    const tokenOut = request.tokenOut.isNative()
      ? NATIVE[chainId]
      : new Token(
          chainId,
          ethers.utils.getAddress(request.tokenOut.address),
          request.tokenOut.decimals,
          request.tokenOut.symbol,
          request.tokenOut.name,
        );

    // compute first the trade with the expected `amountIn`
    const expectedTrade = this.computeTrade(tokenIn, tokenOut, pairs, request.amountIn);

    // then compute, if necessary, what would be the worst case trade with `minAmountIn`
    const worstCaseTrade =
      request.amountIn === request.minAmountIn
        ? expectedTrade
        : this.computeTrade(tokenIn, tokenOut, pairs, request.minAmountIn);

    // if there is no trades, we can't support this step on the route
    if (expectedTrade.length === 0 || worstCaseTrade.length === 0) {
      throw new InsufficientLiquidity();
    }

    const slippage = new Percent(request.slippage * 100, '10000'); // multiply to avoid decimals

    // compute the callData for the expected trade
    const call = Router.swapCallParameters(expectedTrade[0], {
      ttl: 3600 * 24, // 1 day
      recipient: DeployedAddresses.Router,
      allowedSlippage: slippage,
    });
    // there is a trick here, we don't need the worst-case-trade callData because
    // callData is only used for the swap on the origin, the callData on the destination swap
    // computed on the route computing process is never used, and the origin swap will always
    // have equal `amountIn` and `minAmountIn`, so callData would be the same.
    // Why is all this done then?
    // In order to have the expected amountOut computed looking at the pairs liquidity

    const callData = this.encodeCallData(call);

    const expectedAmountOut = BigInteger.fromString(
      expectedTrade[0].outputAmount.numerator.toString(),
    );
    const expectedMinAmountOut = expectedAmountOut.subtractPercentage(request.slippage);

    const worstCaseAmountOut = BigInteger.fromString(
      worstCaseTrade[0].outputAmount.numerator.toString(),
    ).subtractPercentage(request.slippage);

    return new SwapOrder(
      ExchangeProviders.Sushi,
      request.tokenIn,
      request.tokenOut,
      callData,
      request.amountIn,
      expectedAmountOut,
      expectedMinAmountOut,
      worstCaseAmountOut,
      BigInteger.fromString(gasEstimations[chainId]),
    );
  }

  /**
   * Computes a trade given the required parameters
   * This is going to be executed two times in order
   * to know the expected trade and the worst case trade
   * @param tokenIn Token input
   * @param tokenOut Token output
   * @param pairs Pairs used to check
   * @param amountIn Amount that goes in
   * @private
   */
  private computeTrade(
    tokenIn: Token,
    tokenOut: Token,
    pairs: Pair[],
    amountIn: BigInteger,
  ): Trade<Token, Token, TradeType.EXACT_INPUT>[] {
    const tokenInAmount = CurrencyAmount.fromRawAmount(tokenIn, JSBI.BigInt(amountIn.toString()));
    return Trade.bestTradeExactIn(pairs, tokenInAmount, tokenOut);
  }

  /**
   * Fetches any pair that allows to swap from the given `token`
   * to any of the liquid assets on that chain
   * @param chainId Chain ID where we want to look
   * @param token Token that we want to swap
   * @return An object SushiPairs with the existing pairs, if any
   * @private
   */
  private async getExtraPairs(chainId: string, token: OwnToken): Promise<SushiPairs> {
    const liquidTokens = Object.values<string>(TokenAddresses[chainId]);

    let pairs = await this.getPairsOf(chainId, [token.address], liquidTokens);

    if (!pairs.empty()) {
      return pairs;
    }

    pairs = await this.getPairsOf(chainId, liquidTokens, [token.address]);

    return pairs;
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
  private async getPairsOf(
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
      const t0 = new OwnToken(
        row.token0.name,
        ethers.utils.getAddress(row.token0.id),
        Number(row.token0.decimals),
        row.token0.symbol,
      );
      const t1 = new OwnToken(
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

  /**
   * Give our domain specific SushiPair's, create the required Pair's
   * for the sushiswap-sdk to use
   * @param pairs
   * @private
   */
  private convertToNativePairs(pairs: SushiPairs): Pair[] {
    return pairs.map<Pair[]>((sushiPair) => {
      const token0 = new Token(
        Number(sushiPair.chainId),
        ethers.utils.getAddress(sushiPair.token0.address),
        Number(sushiPair.token0.decimals),
        sushiPair.token0.symbol,
        sushiPair.token0.name,
      );
      const token1 = new Token(
        Number(sushiPair.chainId),
        ethers.utils.getAddress(sushiPair.token1.address),
        Number(sushiPair.token1.decimals),
        sushiPair.token1.symbol,
        sushiPair.token1.name,
      );

      const reserve0 = sushiPair.reserve0.toString();
      const reserve1 = sushiPair.reserve1.toString();

      const token0Amount = CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(reserve0));
      const token1Amount = CurrencyAmount.fromRawAmount(token1, JSBI.BigInt(reserve1));

      return new Pair(token0Amount, token1Amount);
    });
  }

  /**
   * Given the swap parameters for the Sushi router
   * this encodes all of it into calldata
   * @param call
   * @private
   */
  private encodeCallData(call: SwapParameters): string {
    let selector, encodedArguments;

    switch (call.methodName) {
      case 'swapExactETHForTokens':
        //bytes4(keccak256(bytes(swapExactETHForTokens(uint256,address[],address,uint256))))
        selector = '0x7ff36ab5';
        encodedArguments = AbiEncoder.encodeFunctionArguments(
          ['uint256', 'address[]', 'address', 'uint256'],
          <string[]>call.args,
        );
        break;
      case 'swapExactTokensForTokens':
        //bytes4(keccak256(bytes(swapExactTokensForTokens(uint256,uint256,address[],address,uint256))))
        selector = '0x38ed1739';
        encodedArguments = AbiEncoder.encodeFunctionArguments(
          ['uint256', 'uint256', 'address[]', 'address', 'uint256'],
          <string[]>call.args,
        );
        break;
      case 'swapExactTokensForETH':
        //bytes4(keccak256(bytes(swapExactTokensForETH(uint256,uint256,address[],address,uint256))))
        selector = '0x18cbafe5';
        encodedArguments = AbiEncoder.encodeFunctionArguments(
          ['uint256', 'uint256', 'address[]', 'address', 'uint256'],
          <string[]>call.args,
        );
        break;
      default:
        throw new Error('Sushiswap: unrecognized method name');
    }

    return AbiEncoder.concatBytes([selector, encodedArguments]);
  }
}
