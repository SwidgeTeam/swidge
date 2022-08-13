import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTransactionCommand } from './create-transaction.command';
import { Transaction } from '../../domain/Transaction';
import { ConfigService } from '../../../config/config.service';
import { TransactionsRepository } from '../../domain/TransactionsRepository';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand>
{
  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.TransactionRepository)
    private readonly repository: TransactionsRepository,
  ) {}

  async execute(command: CreateTransactionCommand): Promise<void> {
    const transaction = Transaction.create(
      command.txHash,
      command.walletAddress,
      command.receiver,
      command.routerAddress,
      command.fromChainId,
      command.toChainId,
      command.srcToken,
      command.bridgeTokenIn,
      command.bridgeTokenOut,
      command.dstToken,
      command.amount,
    );

    await this.repository.save(transaction);
  }
}
