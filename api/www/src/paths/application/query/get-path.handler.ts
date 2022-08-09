import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPathQuery } from './get-path.query';
import { SwapOrderComputer } from '../../../swaps/application/query/swap-order-computer';
import { BridgeOrderComputer } from '../../../bridges/application/query/bridge-order-computer';
import { TokenDetailsFetcher } from '../../../shared/infrastructure/TokenDetailsFetcher';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { PathComputer } from '../../domain/path-computer';
import { PriceFeedFetcher } from '../../../shared/infrastructure/PriceFeedFetcher';
import { GasPriceFetcher } from '../../../shared/infrastructure/GasPriceFetcher';
import { AggregatorOrderComputer } from '../../../aggregators/application/query/aggregator-order-computer';
import { Route } from '../../../shared/domain/route';
import { Bridges } from '../../../bridges/domain/bridges';
import { Multichain } from '../../../bridges/domain/providers/multichain';
import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { CachedHttpClient } from '../../../shared/infrastructure/http/cachedHttpClient';
import { BridgeProviders } from '../../../bridges/domain/providers/bridge-providers';

@QueryHandler(GetPathQuery)
export class GetPathHandler implements IQueryHandler<GetPathQuery> {
  private pathComputer: PathComputer;

  constructor(
    private readonly swapOrderProvider: SwapOrderComputer,
    private readonly bridgeOrderProvider: BridgeOrderComputer,
    private readonly aggregatorOrderProvider: AggregatorOrderComputer,
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
    @Inject(Class.CachedHttpClient) private readonly cachedHttpClient: CachedHttpClient,
    @Inject(Class.TokenDetailsFetcher) private readonly tokenDetailsFetcher: TokenDetailsFetcher,
    @Inject(Class.PriceFeedFetcher) private readonly priceFeedFetcher: PriceFeedFetcher,
    @Inject(Class.GasPriceFetcher) private readonly gasPriceFetcher: GasPriceFetcher,
  ) {
    const bridges = new Bridges([
      [BridgeProviders.Multichain, new Multichain(cachedHttpClient)]
    ]);

    this.pathComputer = new PathComputer(
      swapOrderProvider,
      bridges,
      aggregatorOrderProvider,
      tokenDetailsFetcher,
      priceFeedFetcher,
      gasPriceFetcher,
    );
  }

  async execute(query: GetPathQuery): Promise<Route[]> {
    return this.pathComputer.compute(query);
  }
}
