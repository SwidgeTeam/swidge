import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { Logger } from '../../../shared/domain/logger';
import { AggregatorProviders } from '../../domain/providers/aggregator-providers';
import BuildMainTxQuery from './build-main-tx-query';
import { ConfigService } from '../../../config/config.service';
import { AggregatorTx, SteppedAggregator } from 'src/aggregators/domain/aggregator';
import { CachedGasPriceFetcher } from '../../../shared/domain/cached-gas-price-fetcher';
import { CachedPriceFeedFetcher } from '../../../shared/domain/cached-price-feed-fetcher';
import { Rango } from '../../domain/providers/rango';
import { AggregatorRequest } from '../../domain/aggregator-request';

@QueryHandler(BuildMainTxQuery)
export class BuildMainTxHandler implements IQueryHandler<BuildMainTxQuery> {
  private aggregators: Map<string, SteppedAggregator>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.GasPriceFetcher) private readonly gasPriceFetcher: CachedGasPriceFetcher,
    @Inject(Class.PriceFeedFetcher) private readonly priceFeedFetcher: CachedPriceFeedFetcher,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.aggregators = new Map<string, SteppedAggregator>([
      [AggregatorProviders.Rango, Rango.create(configService.getRangoApiKey(), logger)],
    ]);
  }

  async execute(query: BuildMainTxQuery): Promise<AggregatorTx> {
    this.logger.log(`Building tx for ${query.aggregatorId}...`);
    const request = new AggregatorRequest(
      query.srcToken,
      query.dstToken,
      query.amount,
      query.slippage,
      query.senderAddress,
      query.receiverAddress,
    );
    const aggregator = this.aggregators.get(query.aggregatorId);
    return aggregator.buildTx(request);
  }
}
