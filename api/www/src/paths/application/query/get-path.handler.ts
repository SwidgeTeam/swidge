import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPathQuery } from './get-path.query';
import { TokenDetailsFetcher } from '../../../shared/infrastructure/TokenDetailsFetcher';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { PathComputer } from '../../domain/path-computer';
import { Route } from '../../../shared/domain/route/route';
import { Bridges } from '../../../bridges/domain/bridges';
import { HttpClient } from '../../../shared/infrastructure/http/httpClient';
import { CachedHttpClient } from '../../../shared/infrastructure/http/cachedHttpClient';
import { Exchanges } from '../../../swaps/domain/exchanges';
import { SushiPairsRepository } from '../../../swaps/domain/sushi-pairs-repository';
import { Aggregators } from '../../../aggregators/domain/aggregators';
import { AggregatorProviders } from '../../../aggregators/domain/providers/aggregator-providers';
import { LiFi } from '../../../aggregators/domain/providers/liFi';
import { Logger } from '../../../shared/domain/logger';
import { ViaExchange } from '../../../aggregators/domain/providers/via-exchange';
import { ConfigService } from '../../../config/config.service';
import { Socket } from '../../../aggregators/domain/providers/socket';
import { Rango } from '../../../aggregators/domain/providers/rango';
import { CachedGasPriceFetcher } from '../../../shared/domain/cached-gas-price-fetcher';
import { CachedPriceFeedFetcher } from '../../../shared/domain/cached-price-feed-fetcher';
import { SushiPoolsTheGraph } from '../../../swaps/infrastructure/theGraph/sushi-pools-the-graph';
import { OrderStrategy } from '../../domain/route-order-strategy/order-strategy';

@QueryHandler(GetPathQuery)
export class GetPathHandler implements IQueryHandler<GetPathQuery> {
  private pathComputer: PathComputer;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.HttpClient) private readonly httpClient: HttpClient,
    @Inject(Class.CachedHttpClient) private readonly cachedHttpClient: CachedHttpClient,
    @Inject(Class.TokenDetailsFetcher) private readonly tokenDetailsFetcher: TokenDetailsFetcher,
    @Inject(Class.PriceFeedFetcher) private readonly priceFeedFetcher: CachedPriceFeedFetcher,
    @Inject(Class.GasPriceFetcher) private readonly gasPriceFetcher: CachedGasPriceFetcher,
    @Inject(Class.SushiPairsRepository) private readonly sushiPairsRepository: SushiPairsRepository,
    @Inject(Class.SushiPairsTheGraph) private readonly theGraph: SushiPoolsTheGraph,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    const bridges = new Bridges([]);

    const exchanges = new Exchanges([]);

    const aggregators = new Aggregators([
      [AggregatorProviders.LiFi, LiFi.create()],
      [AggregatorProviders.Socket, new Socket(httpClient, configService.getSocketApiKey())],
      [
        AggregatorProviders.Via,
        ViaExchange.create(configService.getViaApiKey(), gasPriceFetcher, priceFeedFetcher),
      ],
      [AggregatorProviders.Rango, Rango.create(configService.getRangoApiKey(), priceFeedFetcher)],
    ]);

    this.pathComputer = new PathComputer(
      exchanges,
      bridges,
      aggregators,
      tokenDetailsFetcher,
      priceFeedFetcher,
      gasPriceFetcher,
      logger,
    );
  }

  /**
   * Entrypoint
   * @param query
   */
  async execute(query: GetPathQuery): Promise<Route[]> {
    const routes = await this.pathComputer.compute(query);

    return this.tagRoutes(routes);
  }

  /**
   * Add tags to the routes depending on their specifics
   * @param routes
   * @private
   */
  private tagRoutes(routes: Route[]): Route[] {
    const cheapestStrategy = OrderStrategy.get(OrderStrategy.HIGHEST_RETURN);
    const fastestStrategy = OrderStrategy.get(OrderStrategy.LOWEST_TIME);

    const cheapestId = cheapestStrategy.order(routes)[0].id;
    const fastestId = fastestStrategy.order(routes)[0].id;

    return routes.map((route) => {
      if (route.id === cheapestId) {
        route.addTag('cheapest');
      }
      if (route.id === fastestId) {
        route.addTag('fastest');
      }
      return route;
    });
  }
}
