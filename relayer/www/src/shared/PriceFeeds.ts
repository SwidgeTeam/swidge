import { Fantom, Polygon } from './ChainIds';
import { NativeToken, Tokens } from './Tokens';
import { USDC } from './TokenSymbols';

export const PriceFeeds = {
  [Polygon]: {
    [NativeToken]: {
      [Tokens[Polygon][USDC]]: '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
    },
  },
  [Fantom]: {
    [NativeToken]: {
      [Tokens[Fantom][USDC]]: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    },
  },
};
