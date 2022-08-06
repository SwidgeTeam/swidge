import { Avalanche, BSC, Fantom, Optimism, Polygon } from '../../../shared/enums/ChainIds';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CoinGecko = require('coingecko-api');

export abstract class CoingeckoApiBaseClient {
  protected client;

  constructor() {
    this.client = new CoinGecko();
  }

  protected getPlatform(chainId: string): string {
    switch (chainId) {
      case Polygon:
        return 'polygon-pos';
      case BSC:
        return 'binance-smart-chain';
      case Fantom:
        return 'fantom';
      case Optimism:
        return 'optimistic-ethereum';
      case Avalanche:
        return 'avalanche';
      default:
        throw new Error('not supported');
    }
  }
}
