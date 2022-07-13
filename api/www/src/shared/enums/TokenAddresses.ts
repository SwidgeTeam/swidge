import { Polygon, Fantom } from './ChainIds';
import { DAI, USDC, USDT, WETH, WFTM, WMATIC } from './TokenSymbols';

export const TokenAddresses = {
  [Polygon]: {
    [USDC]: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    [USDT]: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    [DAI]: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    [WETH]: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    [WMATIC]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  },
  [Fantom]: {
    [USDC]: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    [USDT]: '0x049d68029688eabf473097a2fc38ef61633a3c7a',
    [DAI]: '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e',
    [WETH]: '0x74b23882a30290451a17c44f4f05243b6b58c76d',
    [WFTM]: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
  },
};
