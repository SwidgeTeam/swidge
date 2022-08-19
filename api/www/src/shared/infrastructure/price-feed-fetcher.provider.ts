import { Class } from '../Class';
import { PriceFeedFetcher } from './price-feed-fetcher';

export default () => {
  return {
    provide: Class.PriceFeedFetcher,
    useClass: PriceFeedFetcher,
  };
};
