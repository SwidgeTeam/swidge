import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { Logger } from '../../../shared/domain/logger';
import { AggregatorProviders } from '../../domain/providers/aggregator-providers';
import { ViaExchange } from '../../domain/providers/via-exchange';
import { SteppedAggregators } from '../../domain/stepped-aggregators';
import BuildTxQuery from './build-tx-query';
import { TransactionDetails } from '../../../shared/domain/transaction-details';

@QueryHandler(BuildTxQuery)
export class BuildTxHandler implements IQueryHandler<BuildTxQuery> {
  private aggregators: SteppedAggregators;

  constructor(
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.aggregators = new SteppedAggregators([
      [AggregatorProviders.Via, new ViaExchange()],
    ]);
  }

  execute(query: BuildTxQuery): Promise<TransactionDetails> {
    const aggregator = this.aggregators.get(query.aggregatorId);
    return aggregator.buildTx(query.routeId, query.senderAddress, query.receiverAddress);
  }
}
