import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { Logger } from '../../../shared/domain/logger';
import { AggregatorProviders } from '../../domain/providers/aggregator-providers';
import { ConfigService } from '../../../config/config.service';
import BuildBothTxsQuery from './build-both-txs-query';
import { Rango } from '../../domain/providers/rango';
import { OneSteppedAggregators } from '../../domain/one-stepped-aggregators';
import BothTxs from '../../domain/both-txs';
import { AggregatorRequest } from '../../domain/aggregator-request';
import { TokenDetailsFetcher } from '../../../shared/infrastructure/TokenDetailsFetcher';

@QueryHandler(BuildBothTxsQuery)
export class BuildBothTxsHandler implements IQueryHandler<BuildBothTxsQuery> {
  private aggregators: OneSteppedAggregators;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
    @Inject(Class.TokenDetailsFetcher) private readonly tokenDetailsFetcher: TokenDetailsFetcher,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.aggregators = new OneSteppedAggregators([
      [AggregatorProviders.Via, Rango.create(configService.getRangoApiKey())],
    ]);
  }

  async execute(query: BuildBothTxsQuery): Promise<BothTxs> {
    const srcToken = await this.tokenDetailsFetcher.fetch(query.srcToken, query.fromChainId);
    const dstToken = await this.tokenDetailsFetcher.fetch(query.dstToken, query.toChainId);
    const request = new AggregatorRequest(
      query.fromChainId,
      query.toChainId,
      srcToken,
      dstToken,
      query.amount,
      query.slippage,
      query.senderAddress,
      query.receiverAddress,
    );
    const aggregator = this.aggregators.get(query.aggregatorId);
    return aggregator.buildTxs(request);
  }
}
