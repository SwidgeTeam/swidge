import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { Logger } from '../../../shared/domain/logger';
import { ConfigService } from '../../../config/config.service';
import CheckTxStatusQuery from './check-tx-status-query';
import { TransactionsRepository } from '../../domain/TransactionsRepository';
import { Transaction } from '../../domain/Transaction';

@QueryHandler(CheckTxStatusQuery)
export class CheckTxStatusHandler implements IQueryHandler<CheckTxStatusQuery> {
  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.TransactionRepository) private readonly repository: TransactionsRepository,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {}

  async execute(query: CheckTxStatusQuery): Promise<Transaction | null> {
    this.logger.log(`Checking status of tx ${query.txId}`);
    return await this.repository.find(query.txId);
  }
}
