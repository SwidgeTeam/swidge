import { Class } from '../Class';
import { CachedPriceFeedFetcher } from '../domain/cached-price-feed-fetcher';

export default () => {
  return {
    provide: Class.PriceFeedFetcher,
    useClass: CachedPriceFeedFetcher,
  };
};
