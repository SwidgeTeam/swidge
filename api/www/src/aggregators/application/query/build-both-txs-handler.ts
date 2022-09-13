import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { Logger } from '../../../shared/domain/logger';
import { AggregatorProviders } from '../../domain/providers/aggregator-providers';
import { ConfigService } from '../../../config/config.service';
import BuildBothTxsQuery from './build-both-txs-query';
import { Rango } from '../../domain/providers/rango';
import BothTxs from '../../domain/both-txs';
import { AggregatorRequest } from '../../domain/aggregator-request';
import { OneSteppedAggregator } from 'src/aggregators/domain/aggregator';

@QueryHandler(BuildBothTxsQuery)
export class BuildBothTxsHandler implements IQueryHandler<BuildBothTxsQuery> {
  private aggregators: Map<string, OneSteppedAggregator>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.aggregators = new Map<string, OneSteppedAggregator>([
      [AggregatorProviders.Rango, Rango.create(configService.getRangoApiKey(), logger)],
    ]);
  }

  async execute(query: BuildBothTxsQuery): Promise<BothTxs> {
    this.logger.log(`Building txs for ${query.aggregatorId}...`);
    const request = new AggregatorRequest(
      query.srcToken,
      query.dstToken,
      query.amount,
      query.slippage,
      query.senderAddress,
      query.receiverAddress,
    );
    const aggregator = this.aggregators.get(query.aggregatorId);
    return aggregator.buildTxs(request);
  }
}
