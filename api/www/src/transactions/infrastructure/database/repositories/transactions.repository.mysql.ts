import { TransactionsRepository } from '../../../domain/TransactionsRepository';
import { EntityManager, EntityRepository } from 'typeorm';
import { Transaction } from '../../../domain/Transaction';
import { TransactionEntity } from '../models/transaction.entity';
import { BigInteger } from '../../../../shared/domain/big-integer';
import { Transactions } from '../../../domain/Transactions';
import { ExternalTransactionStatus } from '../../../../aggregators/domain/status-check';

@EntityRepository(TransactionEntity)
export class TransactionsRepositoryMysql implements TransactionsRepository {
  constructor(private readonly manager: EntityManager) {}

  /**
   * Persists a transaction
   * @param transaction
   */
  async create(transaction: Transaction): Promise<void> {
    await this.manager.insert(TransactionEntity, {
      txHash: transaction.txHash,
      destinationTxHash: transaction.destinationTxHash,
      walletAddress: transaction.walletAddress,
      receiver: transaction.receiver,
      fromChainId: transaction.fromChainId,
      toChainId: transaction.toChainId,
      srcToken: transaction.srcToken,
      dstToken: transaction.dstToken,
      amountIn: transaction.amountIn.toString(),
      amountOut: transaction.amountOut.toString(),
      executed: transaction.executed,
      completed: transaction.completed,
      status: transaction.status,
      aggregatorId: transaction.aggregatorId,
      trackingId: transaction.trackingId,
    });
  }

  /**
   * Persists a transaction
   * @param transaction
   */
  async update(transaction: Transaction): Promise<void> {
    await this.manager.update(
      TransactionEntity,
      {
        txHash: transaction.txHash,
      },
      {
        destinationTxHash: transaction.destinationTxHash,
        walletAddress: transaction.walletAddress,
        receiver: transaction.receiver,
        fromChainId: transaction.fromChainId,
        toChainId: transaction.toChainId,
        srcToken: transaction.srcToken,
        dstToken: transaction.dstToken,
        amountIn: transaction.amountIn.toString(),
        amountOut: transaction.amountOut.toString(),
        executed: transaction.executed,
        completed: transaction.completed,
        status: transaction.status,
        aggregatorId: transaction.aggregatorId,
        trackingId: transaction.trackingId,
      },
    );
  }

  /**
   * Returns a specific transaction, if exists, given its tx hash
   * @param txHash
   */
  async find(txHash: string): Promise<Transaction | null> {
    const result = await this.manager.findOne(TransactionEntity, {
      txHash: txHash,
    });

    if (!result) {
      return null;
    }

    return this.buildTx(result);
  }

  /**
   * Returns all the transactions of a specific wallet address
   * @param walletAddress
   */
  async findAllBy(walletAddress: string): Promise<Transactions> {
    const result = await this.manager.find(TransactionEntity, {
      walletAddress: walletAddress,
    });

    const items = result.map(this.buildTx);

    return new Transactions(items);
  }

  private buildTx(row: TransactionEntity): Transaction {
    return new Transaction(
      row.txHash,
      row.destinationTxHash,
      row.walletAddress,
      row.receiver,
      row.fromChainId,
      row.toChainId,
      row.srcToken,
      row.dstToken,
      BigInteger.fromString(row.amountIn),
      BigInteger.fromString(row.amountOut),
      new Date(row.executed),
      row.completed ? new Date(row.completed) : null,
      row.status as ExternalTransactionStatus,
      row.aggregatorId,
      row.trackingId,
    );
  }
}
