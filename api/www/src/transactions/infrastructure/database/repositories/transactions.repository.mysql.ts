import { TransactionsRepository } from '../../../domain/TransactionsRepository';
import { EntityManager, EntityRepository } from 'typeorm';
import { Transaction } from '../../../domain/Transaction';
import { TransactionEntity } from '../models/transaction.entity';
import { BigInteger } from '../../../../shared/domain/big-integer';
import { Transactions } from '../../../domain/Transactions';

@EntityRepository(TransactionEntity)
export class TransactionsRepositoryMysql implements TransactionsRepository {
  constructor(private readonly manager: EntityManager) {}

  /**
   * Persists a transaction
   * @param transaction
   */
  async create(transaction: Transaction): Promise<void> {
    await this.manager.create(TransactionEntity, {
      txHash: transaction.txHash,
      destinationTxHash: transaction.destinationTxHash,
      walletAddress: transaction.walletAddress,
      fromChainId: transaction.fromChainId,
      toChainId: transaction.toChainId,
      srcToken: transaction.srcToken,
      dstToken: transaction.dstToken,
      amountIn: transaction.amountIn.toString(),
      amountOut: transaction.amountOut.toString(),
      executed: transaction.executed,
      completed: transaction.completed,
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
        fromChainId: transaction.fromChainId,
        toChainId: transaction.toChainId,
        srcToken: transaction.srcToken,
        dstToken: transaction.dstToken,
        amountIn: transaction.amountIn.toString(),
        amountOut: transaction.amountOut.toString(),
        executed: transaction.executed,
        completed: transaction.completed,
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

    return new Transaction(
      result.txHash,
      result.destinationTxHash,
      result.walletAddress,
      result.receiver,
      result.fromChainId,
      result.toChainId,
      result.srcToken,
      result.dstToken,
      BigInteger.fromString(result.amountIn),
      BigInteger.fromString(result.amountOut),
      new Date(result.executed),
      result.completed ? new Date(result.completed) : null,
    );
  }

  /**
   * Returns all the transactions of a specific wallet address
   * @param walletAddress
   */
  async findAllBy(walletAddress: string): Promise<Transactions> {
    const result = await this.manager.find(TransactionEntity, {
      walletAddress: walletAddress,
    });

    const items = result.map((row) => {
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
      );
    });

    return new Transactions(items);
  }
}
