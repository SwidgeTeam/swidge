import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionsRepository } from '../../domain/TransactionsRepository';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { UpdateTransactionCommand } from './update-transaction.command';

@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler
  implements ICommandHandler<UpdateTransactionCommand>
{
  constructor(
    @Inject(Class.TransactionRepository)
    private readonly repository: TransactionsRepository,
  ) {}

  async execute(command: UpdateTransactionCommand): Promise<void> {
    const transaction = await this.repository.find(command.txHash);

    if (command.bridgeAmountIn) {
      const bridgeAmountIn = BigInteger.fromBigNumber(command.bridgeAmountIn);
      transaction.setBridgeAmountIn(bridgeAmountIn);
    }

    if (command.bridgeAmountOut) {
      const bridgeAmountOut = BigInteger.fromBigNumber(command.bridgeAmountOut);
      transaction.setBridgeAmountOut(bridgeAmountOut);
    }

    if (command.amountOut) {
      const amountOut = BigInteger.fromBigNumber(command.amountOut);
      transaction.setAmountOut(amountOut);
    }

    if (command.bridged) {
      const bridgedTime = new Date(command.bridged);
      transaction.markAsBridged(bridgedTime);
    }

    if (command.completed) {
      const completedTime = new Date(command.completed);
      transaction.markAsCompleted(completedTime);
    }


    await this.repository.save(transaction);
  }
}
