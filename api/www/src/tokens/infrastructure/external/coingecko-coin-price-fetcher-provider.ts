import { CoingeckoCoinPriceFetcher } from './coingecko-coin-price-fetcher';
import { Class } from '../../../shared/Class';

export default () => {
  return {
    provide: Class.CoinPriceFetcher,
    useClass: CoingeckoCoinPriceFetcher,
  };
};
