import { CoinPriceFetcher } from '../../domain/coin-price-fetcher';
import { CoingeckoApiBaseClient } from './coingecko-api-base-client';

export class CoingeckoCoinPriceFetcher extends CoingeckoApiBaseClient implements CoinPriceFetcher {
  public async fetch(id: string): Promise<number> {
    const coin = await this.client.coins.fetch(id, {
      localization: false,
      community_data: false,
      developer_data: false,
      tickers: false,
    });

    return coin.data.market_data.current_price.usd;
  }
}
