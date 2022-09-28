import { TransactionsRepository } from '../../../domain/TransactionsRepository';
import { EntityManager, EntityRepository } from 'typeorm';
import { Transaction } from '../../../domain/Transaction';
import { TransactionEntity } from '../models/transaction.entity';
import { TransactionStepEntity } from '../models/transaction-step.entity';
import { BigInteger } from '../../../../shared/domain/big-integer';
import { Transactions } from '../../../domain/Transactions';
import { ExternalTransactionStatus } from '../../../../aggregators/domain/status-check';
import { TransactionStep } from '../../../domain/TransactionStep';

@EntityRepository(TransactionEntity)
export class TransactionsRepositoryMysql implements TransactionsRepository {
  constructor(private readonly manager: EntityManager) {}

  /**
   * Persists a transaction
   * @param transaction
   */
  async create(transaction: Transaction): Promise<void> {
    await this.manager.insert(TransactionEntity, {
      txId: transaction.id,
      walletAddress: transaction.walletAddress,
      receiver: transaction.receiver,
      fromChainId: transaction.fromChainId,
      toChainId: transaction.toChainId,
      srcToken: transaction.srcToken,
      dstToken: transaction.dstToken,
      executed: transaction.executed,
      completed: transaction.completed,
      status: transaction.status,
    });

    for (const step of transaction.steps) {
      await this.manager.insert(TransactionStepEntity, {
        txId: transaction.id,
        originTxHash: step.originTxHash,
        destinationTxHash: step.destinationTxHash,
        fromChainId: step.fromChainId,
        toChainId: step.toChainId,
        srcToken: step.srcToken,
        dstToken: step.dstToken,
        amountIn: step.amountIn,
        amountOut: step.amountOut,
        aggregatorId: step.aggregatorId,
        trackingId: step.trackingId,
        status: step.status,
        executed: step.executed,
        completed: step.completed,
      });
    }
  }

  /**
   * Persists a transaction
   * @param transaction
   */
  async update(transaction: Transaction): Promise<void> {
    await this.manager.update(
      TransactionEntity,
      {
        txId: transaction.id,
      },
      {
        completed: transaction.completed,
        status: transaction.status,
      },
    );

    const step = transaction.lastStep();

    await this.manager.update(
      TransactionStepEntity,
      {
        txId: transaction.id,
        originTxHash: step.originTxHash,
      },
      {
        destinationTxHash: step.destinationTxHash,
        dstToken: step.dstToken,
        amountOut: step.amountOut,
        status: step.status,
        completed: step.completed,
      },
    );
  }

  /**
   * Returns a specific transaction, if exists, given its tx hash
   * @param txId
   */
  async find(txId: string): Promise<Transaction | null> {
    const result = await this.manager.findOne(TransactionEntity, {
      txId: txId,
    });

    if (!result) {
      return null;
    }

    return this.buildTx(result);
  }

  /**
   * Returns a specific transaction, if exists, given its tx hash
   */
  async getPending(): Promise<Transactions> {
    const result = await this.manager.find(TransactionEntity, {
      status: ExternalTransactionStatus.Pending,
    });

    const items = [];

    for (const row of result) {
      items.push(await this.buildTx(row));
    }

    return new Transactions(items);
  }

  /**
   * Returns all the transactions of a specific wallet address
   * @param walletAddress
   */
  async findAllBy(walletAddress: string): Promise<Transactions> {
    const result = await this.manager.find(TransactionEntity, {
      walletAddress: walletAddress,
    });

    const items = [];

    for (const row of result) {
      items.push(await this.buildTx(row));
    }

    return new Transactions(items);
  }

  private async buildTx(row: TransactionEntity): Promise<Transaction> {
    const tx = new Transaction(
      row.txId,
      row.walletAddress,
      row.receiver,
      row.fromChainId,
      row.toChainId,
      row.srcToken,
      row.dstToken,
      new Date(row.executed),
      row.completed ? new Date(row.completed) : null,
      row.status as ExternalTransactionStatus,
    );

    const steps = await this.manager.find(TransactionStepEntity, {
      txId: row.txId,
    });

    for (const step of steps) {
      tx.addStep(
        new TransactionStep(
          step.originTxHash,
          step.destinationTxHash,
          step.fromChainId,
          step.toChainId,
          step.srcToken,
          step.dstToken,
          BigInteger.fromString(step.amountIn),
          BigInteger.fromString(step.amountOut),
          new Date(step.executed),
          step.completed ? new Date(step.completed) : null,
          step.status as ExternalTransactionStatus,
          step.aggregatorId,
          step.trackingId,
        ),
      );
    }

    return tx;
  }
}
