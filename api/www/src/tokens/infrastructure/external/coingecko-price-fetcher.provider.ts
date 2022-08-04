import { CoingeckoPriceFetcher } from './coingecko-price-fetcher';
import { Class } from '../../../shared/Class';

export default () => {
  return {
    provide: Class.TokenDollarValueFetcher,
    useClass: CoingeckoPriceFetcher,
  };
};
