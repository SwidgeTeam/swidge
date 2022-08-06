import { CoingeckoCoinsPriceFetcher } from './coingecko-coins-price-fetcher';
import { Class } from '../../../shared/Class';

export default () => {
  return {
    provide: Class.CoinsPriceFetcher,
    useClass: CoingeckoCoinsPriceFetcher,
  };
};
