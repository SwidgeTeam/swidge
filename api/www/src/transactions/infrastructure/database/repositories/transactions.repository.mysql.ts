import { TransactionsRepository } from '../../../domain/TransactionsRepository';
import { EntityManager, EntityRepository } from 'typeorm';
import { Transaction } from '../../../domain/Transaction';
import { TransactionEntity } from '../models/transaction.entity';
import { BigInteger } from '../../../../shared/domain/BigInteger';

@EntityRepository(TransactionEntity)
export class TransactionsRepositoryMysql implements TransactionsRepository {
  constructor(private readonly manager: EntityManager) {}

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
      BigInteger.fromBigNumber(result.amountIn),
      BigInteger.fromBigNumber(result.bridgeAmountIn),
      BigInteger.fromBigNumber(result.bridgeAmountOut),
      BigInteger.fromBigNumber(result.amountOut),
      new Date(result.executed),
      result.bridged ? new Date(result.bridged) : null,
      result.completed ? new Date(result.completed) : null,
    );
  }
}
