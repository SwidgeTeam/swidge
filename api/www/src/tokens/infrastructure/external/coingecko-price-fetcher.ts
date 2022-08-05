import { TokenDollarValueFetcher } from '../../domain/token-dollar-value-fetcher';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CoinGecko = require('coingecko-api');

export class CoingeckoPriceFetcher implements TokenDollarValueFetcher {
  private client;

  constructor() {
    this.client = new CoinGecko();
  }

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
