import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPathQuery } from './get-path.query';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { Route } from '../../../shared/domain/route/route';
import { Aggregators } from '../../../aggregators/domain/aggregators';
import { AggregatorProviders } from '../../../aggregators/domain/providers/aggregator-providers';
import { LiFi } from '../../../aggregators/domain/providers/liFi';
import { Logger } from '../../../shared/domain/logger';
import { ConfigService } from '../../../config/config.service';
import { Rango } from '../../../aggregators/domain/providers/rango';
import { OrderStrategy } from '../../domain/route-order-strategy/order-strategy';
import { AggregatorsPathComputer } from '../../../aggregators/domain/aggregators-path-computer';

@QueryHandler(GetPathQuery)
export class GetPathHandler implements IQueryHandler<GetPathQuery> {
  private pathComputer: AggregatorsPathComputer;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    const aggregators = new Aggregators([
      [AggregatorProviders.LiFi, LiFi.create()],
      [AggregatorProviders.Rango, Rango.create(configService.getRangoApiKey())],
    ]);

    this.pathComputer = new AggregatorsPathComputer(aggregators, logger);
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

    let orderedRoutes = fastestStrategy.order(routes);
    orderedRoutes[0].tags.push('fastest');
    orderedRoutes = cheapestStrategy.order(orderedRoutes);
    orderedRoutes[0].tags.push('cheapest');

    return orderedRoutes;
  }
}
