import { PriceFeed } from './price-feed';

export interface IPriceFeedFetcher {
  fetch: (chainId: string) => Promise<PriceFeed>;
}
