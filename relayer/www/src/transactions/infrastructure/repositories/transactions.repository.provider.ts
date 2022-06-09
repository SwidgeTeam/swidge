import { Class } from '../../../shared/Class';
import { TransactionsRepositoryImpl } from './transactions.repository';

export default () => {
  return {
    provide: Class.TransactionsRepository,
    useClass: TransactionsRepositoryImpl,
  };
};
