import { Class } from '../../../../shared/Class';
import { TransactionsRepositoryMysql } from './transactions.repository.mysql';

export default () => {
  return {
    provide: Class.TransactionRepository,
    useClass: TransactionsRepositoryMysql,
  };
};
