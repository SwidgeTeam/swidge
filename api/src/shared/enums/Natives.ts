import { Fantom, Polygon } from './ChainIds';

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
};
