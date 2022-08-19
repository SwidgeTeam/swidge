import { Class } from '../Class';
import { GasPriceFetcher } from './gas-price-fetcher';

export default () => {
  return {
    provide: Class.GasPriceFetcher,
    useClass: GasPriceFetcher,
  };
};
