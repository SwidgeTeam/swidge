import { TransactionsRepository } from '../../../domain/TransactionsRepository';
import { EntityManager, EntityRepository } from 'typeorm';
import { Transaction } from '../../../domain/Transaction';
import { TransactionEntity } from '../models/transaction.entity';
import { BigInteger } from '../../../../shared/domain/BigInteger';
import { Transactions } from '../../../domain/Transactions';

@EntityRepository(TransactionEntity)
export class TransactionsRepositoryMysql implements TransactionsRepository {
  constructor(private readonly manager: EntityManager) {}

  /**
   * Persists a transaction
   * @param transaction
   */
  async save(transaction: Transaction): Promise<void> {
    await this.manager.save(TransactionEntity, {
      txHash: transaction.txHash,
      walletAddress: transaction.walletAddress,
      routerAddress: transaction.routerAddress,
      fromChainId: transaction.fromChainId,
      toChainId: transaction.toChainId,
      srcToken: transaction.srcToken,
      bridgeTokenIn: transaction.bridgeTokenIn,
      bridgeTokenOut: transaction.bridgeTokenOut,
      dstToken: transaction.dstToken,
      amountIn: transaction.amountIn.toString(),
      amountOut: transaction.amountOut.toString(),
      bridgeAmountIn: transaction.bridgeAmountIn.toString(),
      bridgeAmountOut: transaction.bridgeAmountOut.toString(),
      executed: transaction.executed,
      bridged: transaction.bridged,
      completed: transaction.completed,
    });
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
      result.walletAddress,
      result.routerAddress,
      result.fromChainId,
      result.toChainId,
      result.srcToken,
      result.bridgeTokenIn,
      result.bridgeTokenOut,
      result.dstToken,
      BigInteger.fromString(result.amountIn),
      BigInteger.fromString(result.bridgeAmountIn),
      BigInteger.fromString(result.bridgeAmountOut),
      BigInteger.fromString(result.amountOut),
      new Date(result.executed),
      result.bridged ? new Date(result.bridged) : null,
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
        row.walletAddress,
        row.routerAddress,
        row.fromChainId,
        row.toChainId,
        row.srcToken,
        row.bridgeTokenIn,
        row.bridgeTokenOut,
        row.dstToken,
        BigInteger.fromBigNumber(row.amountIn),
        BigInteger.fromBigNumber(row.bridgeAmountIn),
        BigInteger.fromBigNumber(row.bridgeAmountOut),
        BigInteger.fromBigNumber(row.amountOut),
        new Date(row.executed),
        row.bridged ? new Date(row.bridged) : null,
        row.completed ? new Date(row.completed) : null,
      );
    });

    return new Transactions(items);
  }
}
