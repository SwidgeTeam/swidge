import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import BuildTxApprovalQuery from './build-tx-approval-query';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { Logger } from '../../../shared/domain/logger';
import { AggregatorProviders } from '../../domain/providers/aggregator-providers';
import { ViaExchange } from '../../domain/providers/via-exchange';
import { ApprovalTransactionDetails } from '../../../shared/domain/route/approval-transaction-details';
import { ConfigService } from '../../../config/config.service';
import { TwoSteppedAggregator } from 'src/aggregators/domain/aggregator';
import { CachedGasPriceFetcher } from '../../../shared/domain/cached-gas-price-fetcher';
import { CachedPriceFeedFetcher } from '../../../shared/domain/cached-price-feed-fetcher';

@QueryHandler(BuildTxApprovalQuery)
export class BuildTxApprovalHandler implements IQueryHandler<BuildTxApprovalQuery> {
  private aggregators: Map<string, TwoSteppedAggregator>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.GasPriceFetcher) private readonly gasPriceFetcher: CachedGasPriceFetcher,
    @Inject(Class.PriceFeedFetcher) private readonly priceFeedFetcher: CachedPriceFeedFetcher,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.aggregators = new Map<string, TwoSteppedAggregator>([
      [
        AggregatorProviders.Via,
        ViaExchange.create(configService.getViaApiKey(), gasPriceFetcher, priceFeedFetcher),
      ],
    ]);
  }

  execute(query: BuildTxApprovalQuery): Promise<ApprovalTransactionDetails> {
    const aggregator = this.aggregators.get(query.aggregatorId);
    return aggregator.buildApprovalTx(query.routeId, query.senderAddress);
  }
}
