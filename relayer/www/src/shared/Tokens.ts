import { Fantom, Polygon } from './ChainIds';
import { USDC } from './TokenSymbols';

export const NativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const Tokens = {
  [Polygon]: {
    [USDC]: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  },
  [Fantom]: {
    [USDC]: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
  },
};
