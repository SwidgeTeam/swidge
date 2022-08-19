import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { Logger } from '../../../shared/domain/logger';
import { AggregatorProviders } from '../../domain/providers/aggregator-providers';
import { ConfigService } from '../../../config/config.service';
import CheckTxStatusQuery from './check-tx-status-query';
import { ViaExchange } from '../../domain/providers/via-exchange';
import { StatusCheckResponse } from '../../domain/status-check';
import { ExternalAggregator } from 'src/aggregators/domain/aggregator';
import { Rango } from '../../domain/providers/rango';

@QueryHandler(CheckTxStatusQuery)
export class CheckTxStatusHandler implements IQueryHandler<CheckTxStatusQuery> {
  private aggregators: Map<string, ExternalAggregator>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.aggregators = new Map<string, ExternalAggregator>([
      [AggregatorProviders.Via, ViaExchange.create(configService.getViaApiKey())],
      [AggregatorProviders.Rango, Rango.create(configService.getRangoApiKey())],
    ]);
  }

  async execute(query: CheckTxStatusQuery): Promise<StatusCheckResponse> {
    return this.aggregators.get(query.aggregatorId).checkStatus({
      fromChain: query.fromChain,
      toChain: query.toChain,
      txHash: query.txHash,
      trackingId: query.trackingId,
    });
  }
}
