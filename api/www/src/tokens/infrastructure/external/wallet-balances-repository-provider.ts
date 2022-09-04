import { Class } from '../../../shared/Class';
import { DeBankOpenApi } from './de-bank-open-api';

export default () => {
  return {
    provide: Class.WalletBalancesRepo,
    useClass: DeBankOpenApi,
  };
};
