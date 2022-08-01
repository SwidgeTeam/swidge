import { Transaction } from './Transaction';
import { Transactions } from './Transactions';

export interface TransactionsRepository {
  save(transaction: Transaction): Promise<void>;

  find(txHash: string): Promise<Transaction | null>;

  findAllBy(walletAddress: string): Promise<Transactions>;
}
