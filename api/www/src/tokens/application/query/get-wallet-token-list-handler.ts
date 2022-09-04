import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Class } from '../../../shared/Class';
import { GetWalletTokenListQuery } from './get-wallet-token-list-query';
import { WalletBalancesRepository } from '../../domain/wallet-balances-repository';
import { WalletBalances } from '../../domain/wallet-balances';

@QueryHandler(GetWalletTokenListQuery)
export class GetWalletTokenListHandler implements IQueryHandler<GetWalletTokenListQuery> {
  constructor(
    @Inject(Class.WalletBalancesRepo) private readonly repository: WalletBalancesRepository,
  ) {}

  execute(query: GetWalletTokenListQuery): Promise<WalletBalances> {
    return this.repository.getTokenList(query.wallet);
  }
}
