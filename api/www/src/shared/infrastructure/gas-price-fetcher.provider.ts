import { Class } from '../Class';
import { CachedGasPriceFetcher } from '../domain/cached-gas-price-fetcher';

export default () => {
  return {
    provide: Class.GasPriceFetcher,
    useClass: CachedGasPriceFetcher,
  };
};
