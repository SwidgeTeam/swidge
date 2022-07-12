import { HttpClient } from './src/shared/http/httpClient';
import {
  CurrencyAmount,
  JSBI,
  Pair,
  Percent,
  Router,
  Token,
  Trade,
  NATIVE,
  WETH9,
} from '@sushiswap/sdk';
import { ethers } from 'ethers';
import { RpcNode } from './src/shared/enums/RpcNode';

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

async function main() {
  const client = new HttpClient();

  const result = await client.post<{
    data: {
      pairs: GraphPair[];
    };
  }>('https://sushi.graph.t.hmny.io/subgraphs/name/sushiswap/harmony-exchange', {
    query: `
    {
      pairs(
        orderBy: volumeUSD
        orderDirection: desc
        first: 10
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
  });

  const pairs = [];

  console.log(result.data.pairs);

  return;

  for (const data of result.data.pairs) {
    const t0 = data.token0;
    const t1 = data.token1;
    const token0 = new Token(
      137,
      ethers.utils.getAddress(t0.id),
      Number(t0.decimals),
      t0.symbol,
      t0.name,
    );
    const token1 = new Token(
      137,
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

  //const USDC = new Token(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 18, 'USDC', 'USD Coin');
  const usdcAmount = CurrencyAmount.fromRawAmount(
    NATIVE[137],
    JSBI.BigInt(ethers.utils.parseUnits('1', 18).toString()),
  );

  const YFI = new Token(
    137,
    '0xaaa5b9e6c589642f98a1cda99b9d024b8407285a',
    18,
    'TITAN',
    'Titan',
  );

  const trade = Trade.bestTradeExactIn(pairs, usdcAmount, YFI);

  const call = Router.swapCallParameters(trade[0], {
    ttl: 3600 * 24,
    recipient: '0x0000000000000000000000000000000000000004',
    allowedSlippage: new Percent('1', '100'),
  });

  const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/');
  const abiInterface = new ethers.utils.Interface([
    'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) external payable returns (uint[] memory amounts)',
  ]);
  const contract = new ethers.Contract(
    '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    abiInterface,
    provider,
  );
  const gas = await contract.estimateGas.swapExactETHForTokens(...call.args, {
    value: ethers.utils.parseUnits('1', 18),
  });
  console.log(gas.toString());
}

main();
