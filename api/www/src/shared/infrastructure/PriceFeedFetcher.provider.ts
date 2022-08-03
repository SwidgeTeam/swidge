import { Class } from '../Class';
import { PriceFeedFetcher } from './PriceFeedFetcher';

export default () => {
  return {
    provide: Class.PriceFeedFetcher,
    useClass: PriceFeedFetcher,
  };
};
