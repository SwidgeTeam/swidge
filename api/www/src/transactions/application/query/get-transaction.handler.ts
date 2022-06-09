import { TransactionsRepository } from '../../domain/TransactionsRepository';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTransactionQuery } from './get-transaction.query';
import { Transaction } from '../../domain/Transaction';
import { Inject, NotFoundException } from '@nestjs/common';
import { Class } from '../../../shared/Class';

@QueryHandler(GetTransactionQuery)
export class GetTransactionHandler
  implements IQueryHandler<GetTransactionQuery>
{
  constructor(
    @Inject(Class.TransactionRepository)
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async execute(query: GetTransactionQuery): Promise<Transaction> {
    const transaction = await this.transactionsRepository.find(query.txHash);

    if (transaction === null) {
      throw new NotFoundException();
    }

    return transaction;
  }
}
