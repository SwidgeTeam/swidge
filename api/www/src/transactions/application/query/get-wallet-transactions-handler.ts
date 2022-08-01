import { TransactionsRepository } from '../../domain/TransactionsRepository';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { GetWalletTransactionsQuery } from './get-wallet-transactions-query';
import { Transactions } from '../../domain/Transactions';

@QueryHandler(GetWalletTransactionsQuery)
export class GetWalletTransactionsHandler implements IQueryHandler<GetWalletTransactionsQuery> {
  constructor(
    @Inject(Class.TransactionRepository)
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async execute(query: GetWalletTransactionsQuery): Promise<Transactions> {
    return await this.transactionsRepository.findAllBy(query.walletAddress);
  }
}
