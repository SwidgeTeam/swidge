import { Collection } from '../../shared/Collection';
import { Transaction } from './Transaction';

export class Transactions extends Collection {
  type() {
    return Transaction;
  }

  public sortNewest(): Transactions {
    const items = this.items<Transaction[]>().sort((a, b) => {
      if (a.executed.getTime() > b.executed.getTime()) {
        return -1;
      } else if (a.executed.getTime() < b.executed.getTime()) {
        return 1;
      } else {
        return 0;
      }
    });

    return new Transactions(items);
  }
}
