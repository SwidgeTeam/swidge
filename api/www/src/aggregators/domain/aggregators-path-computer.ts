import { Token } from '../../shared/domain/token';
import { BigInteger } from '../../shared/domain/big-integer';
import { flatten } from 'lodash';
import { AggregatorRequest } from './aggregator-request';
import { Route } from '../../shared/domain/route/route';
import { Aggregators } from './aggregators';
import { Logger } from '../../shared/domain/logger';
import { GetPathQuery } from '../../paths/application/query/get-path.query';
import { PathNotFound } from '../../paths/domain/path-not-found';

export class AggregatorsPathComputer {
  /** Providers */
  private readonly aggregators: Aggregators;
  private readonly logger: Logger;
  /** Details */
  private srcToken: Token;
  private dstToken: Token;
  private fromChain: string;
  private toChain: string;
  private amountIn: BigInteger;
  private totalSlippage: number;
  private senderAddress: string;
  private receiverAddress: string;

  constructor(_aggregators: Aggregators, _logger: Logger) {
    this.aggregators = _aggregators;
    this.logger = _logger;
  }

  /**
   * Computes the routes
   * @param query
   */
  public async compute(query: GetPathQuery): Promise<Route[]> {
    this.fromChain = query.fromChainId;
    this.toChain = query.toChainId;
    this.srcToken = query.srcToken;
    this.dstToken = query.dstToken;
    this.amountIn = BigInteger.fromDecimal(query.amountIn, this.srcToken.decimals);
    this.totalSlippage = query.slippage;
    this.senderAddress = query.senderAddress;
    this.receiverAddress = query.receiverAddress;

    const routes = await this.getAggregatorsRoutes();

    if (routes.length === 0) {
      throw new PathNotFound();
    }

    return routes;
  }

  /**
   * Fetches all the possible routes
   * from the different aggregator providers
   * @private
   */
  private async getAggregatorsRoutes(): Promise<Route[]> {
    const aggregatorRequest = new AggregatorRequest(
      this.fromChain,
      this.toChain,
      this.srcToken,
      this.dstToken,
      this.amountIn,
      this.totalSlippage,
      this.senderAddress,
      this.receiverAddress,
    );
    const promises = [];
    // for every integrated aggregator
    for (const aggregatorId of this.getPossibleAggregators()) {
      this.logger.log(`Checking aggregator ${aggregatorId}`);
      // ask for their routes
      const promiseRoute = this.aggregators.execute(aggregatorId, aggregatorRequest);
      promises.push(promiseRoute);
    }

    // resolve promises and flatten results
    const results = (await Promise.allSettled(promises))
      .filter((result) => result.status === 'fulfilled')
      .map((result: PromiseFulfilledResult<Route>) => result.value);
    return flatten(results);
  }

  /**
   * Returns the available aggregators given the origin/destination chain combination
   * @private
   */
  private getPossibleAggregators(): string[] {
    return this.aggregators.getEnabled(this.fromChain, this.toChain);
  }
}
