import { PriceFeed } from './PriceFeed';

export interface IPriceFeedFetcher {
  fetch: (chainId: string) => Promise<PriceFeed>;
}
