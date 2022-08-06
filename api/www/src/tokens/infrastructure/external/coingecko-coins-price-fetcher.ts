import { CoinsPriceFetcher } from '../../domain/coins-price-fetcher';
import { CoingeckoApiBaseClient } from './coingecko-api-base-client';

export class CoingeckoCoinsPriceFetcher
  extends CoingeckoApiBaseClient
  implements CoinsPriceFetcher
{
  public async fetch(ids: string[]): Promise<
    {
      id: string;
      price: number;
    }[]
  > {
    const prices = await this.client.simple.price({
      ids: ids,
      vs_currencies: 'usd',
    });

    const results = [];
    for (const [id, price] of Object.entries(prices.data)) {
      results.push({
        id: id,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        price: price.usd,
      });
    }
    return results;
  }
}
