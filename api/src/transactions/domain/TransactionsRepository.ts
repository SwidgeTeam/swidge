import { Transaction } from './Transaction';

export interface TransactionsRepository {
  save(transaction: Transaction): Promise<void>;

  find(txHash: string): Promise<Transaction | null>;
}
