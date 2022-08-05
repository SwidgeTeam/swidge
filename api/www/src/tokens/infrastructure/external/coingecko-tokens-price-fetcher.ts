import { TokensPriceFetcher } from '../../domain/tokens-price-fetcher';
import { CoingeckoApiBaseClient } from './coingecko-api-base-client';

export class CoingeckoTokensPriceFetcher
  extends CoingeckoApiBaseClient
  implements TokensPriceFetcher
{
  async fetch(addresses: string[], chainId: string): Promise<{ address: string; price: number }[]> {
    const prices = await this.client.simple.fetchTokenPrice(
      {
        contract_addresses: addresses,
        vs_currencies: 'usd',
      },
      this.getPlatform(chainId),
    );

    const results = [];
    for (const [address, price] of Object.entries(prices.data)) {
      results.push({
        address: address,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        price: price.usd,
      });
    }
    return results;
  }
}
