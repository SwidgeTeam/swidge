import { Collection } from '../../shared/Collection';
import { Transaction } from './Transaction';

export class Transactions extends Collection {
  type() {
    return Transaction;
  }
}
