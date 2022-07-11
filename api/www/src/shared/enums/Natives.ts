import { Avalanche, BSC, Fantom, Polygon, Optimism } from './ChainIds';

export const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const Natives = {
  [Polygon]: {
    name: 'Matic Token',
    symbol: 'MATIC',
    decimals: 18,
  },
  [Fantom]: {
    name: 'Fantom Token',
    symbol: 'FTM',
    decimals: 18,
  },
  [BSC]: {
    name: 'BNB Token',
    symbol: 'BNB',
    decimals: 18,
  },
  [Avalanche]: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  [Optimism]: {
    name: 'Optimism ETH',
    symbol: 'OETH',
    decimals: 18,
  },
};
