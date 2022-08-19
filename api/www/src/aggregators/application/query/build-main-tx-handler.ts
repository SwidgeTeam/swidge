import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { Logger } from '../../../shared/domain/logger';
import { AggregatorProviders } from '../../domain/providers/aggregator-providers';
import { ViaExchange } from '../../domain/providers/via-exchange';
import BuildMainTxQuery from './build-main-tx-query';
import { TransactionDetails } from '../../../shared/domain/transaction-details';
import { ConfigService } from '../../../config/config.service';
import { TwoSteppedAggregator } from 'src/aggregators/domain/aggregator';

@QueryHandler(BuildMainTxQuery)
export class BuildMainTxHandler implements IQueryHandler<BuildMainTxQuery> {
  private aggregators: Map<string, TwoSteppedAggregator>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.aggregators = new Map<string, TwoSteppedAggregator>([
      [AggregatorProviders.Via, ViaExchange.create(configService.getViaApiKey())],
    ]);
  }

  execute(query: BuildMainTxQuery): Promise<TransactionDetails> {
    const aggregator = this.aggregators.get(query.aggregatorId);
    return aggregator.buildTx(query.routeId, query.senderAddress, query.receiverAddress);
  }
}
