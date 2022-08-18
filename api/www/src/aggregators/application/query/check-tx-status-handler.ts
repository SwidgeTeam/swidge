import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { Logger } from '../../../shared/domain/logger';
import { AggregatorProviders } from '../../domain/providers/aggregator-providers';
import { ConfigService } from '../../../config/config.service';
import { TokenDetailsFetcher } from '../../../shared/infrastructure/TokenDetailsFetcher';
import CheckTxStatusQuery from './check-tx-status-query';
import { ExternalAggregator } from '../../domain/external-aggregator';
import { ViaExchange } from '../../domain/providers/via-exchange';
import { StatusCheckResponse } from '../../domain/status-check';

@QueryHandler(CheckTxStatusQuery)
export class CheckTxStatusHandler implements IQueryHandler<CheckTxStatusQuery> {
  private aggregators: Map<string, ExternalAggregator>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
    @Inject(Class.TokenDetailsFetcher) private readonly tokenDetailsFetcher: TokenDetailsFetcher,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.aggregators = new Map<string, ExternalAggregator>([
      [AggregatorProviders.Via, ViaExchange.create(configService.getViaApiKey())],
    ]);
  }

  async execute(query: CheckTxStatusQuery): Promise<StatusCheckResponse> {
    const aggregator = this.aggregators.get(query.aggregatorId);
    return aggregator.checkStatus({
      fromChain: query.fromChain,
      toChain: query.toChain,
      txHash: query.txHash,
      trackingId: query.trackingId,
    });
  }
}
