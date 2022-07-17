import { SwapRequest } from '../SwapRequest';
import { SwapOrder } from '../SwapOrder';
import { BSC, Fantom, Mainnet, Polygon } from '../../../shared/enums/ChainIds';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { BigNumber, ethers } from 'ethers';
import { Exchange } from '../exchange';
import { IHttpClient } from '../../../shared/http/IHttpClient';
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
} from '@sushiswap/sdk';
import { SushiPairsRepository } from '../sushi-pairs-repository';
import { AbiEncoder } from '../../../shared/domain/CallEncoder';
import { DeployedAddresses } from '../../../shared/DeployedAddresses';
import { SushiPairs } from '../sushi-pairs';

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

  public static create(httpClient: IHttpClient, repository: SushiPairsRepository) {
    return new Sushiswap(httpClient, repository);
  }

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
    const sushiPairs = await this.repository.getPairs(request.chainId);
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

    const tokenInAmount = CurrencyAmount.fromRawAmount(
      tokenIn,
      JSBI.BigInt(request.amountIn.toString()),
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

    const trade = Trade.bestTradeExactIn(pairs, tokenInAmount, tokenOut);

    if (trade.length === 0) {
      throw new Error('NO_PATH');
    }

    const call = Router.swapCallParameters(trade[0], {
      ttl: 3600 * 24, // 1 day
      recipient: DeployedAddresses.Router,
      allowedSlippage: new Percent('1', '100'),
    });

    const callData = this.encodeCallData(call);

    return new SwapOrder(
      ExchangeProviders.Sushi,
      request.tokenIn,
      request.tokenOut,
      '',
      callData,
      BigInteger.fromBigNumber(trade[0].outputAmount.numerator.toString()),
      BigNumber.from(gasEstimations[chainId]),
    );
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