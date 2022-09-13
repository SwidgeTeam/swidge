import { Transaction } from './Transaction';
import { Transactions } from './Transactions';

export interface TransactionsRepository {
  create(transaction: Transaction): Promise<void>;

  update(transaction: Transaction): Promise<void>;

  find(txHash: string): Promise<Transaction | null>;

  findAllBy(walletAddress: string): Promise<Transactions>;
}
