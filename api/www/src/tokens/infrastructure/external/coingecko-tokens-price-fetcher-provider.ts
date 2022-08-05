import { Class } from '../../../shared/Class';
import { CoingeckoTokensPriceFetcher } from './coingecko-tokens-price-fetcher';

export default () => {
  return {
    provide: Class.TokensPriceFetcher,
    useClass: CoingeckoTokensPriceFetcher,
  };
};
