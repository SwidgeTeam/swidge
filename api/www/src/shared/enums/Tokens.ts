import { Mainnet, Polygon, Fantom, BSC } from './ChainIds';
import { USDC } from './TokenSymbols';
import { Token } from '../domain/Token';

export const Tokens = {
  [USDC]: {
    [Mainnet]: new Token(USDC, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6),
    [Polygon]: new Token(USDC, '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 6),
    [Fantom]: new Token(
      'USDCoin',
      '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
      6,
    ),
    [BSC]: new Token(
      'USDCoin',
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      18,
    ),
  },
};
