import { Class } from '../../../shared/Class';
import { CoinmarketcapApi } from './coinmarketcap-api';

export default () => {
  return {
    provide: Class.CoinmarketcapApi,
    useClass: CoinmarketcapApi,
  };
};
