import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPathQuery } from './get-path.query';
import { Path } from '../../domain/path';
import { SwapOrderComputer } from '../../../swaps/application/query/swap-order-computer';
import { SwapRequest } from '../../../swaps/domain/SwapRequest';
import { BridgeOrderComputer } from '../../../bridges/application/query/bridge-order-computer';
import { SwapOrder } from '../../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../../bridges/domain/bridging-order';
import { TokenDetailsFetcher } from '../../../shared/infrastructure/TokenDetailsFetcher';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { ExchangeProviders } from '../../../swaps/domain/providers/exchange-providers';
import { PathComputer } from '../../domain/path-computer';
import { PriceFeedFetcher } from '../../../shared/infrastructure/PriceFeedFetcher';
import { GasPriceFetcher } from '../../../shared/infrastructure/GasPriceFetcher';
import { PriceFeed } from '../../../shared/domain/PriceFeed';
import { PathNotFound } from '../../domain/path-not-found';
import { AggregatorOrderComputer } from '../../../aggregators/application/query/aggregator-order-computer';

@QueryHandler(GetPathQuery)
export class GetPathHandler implements IQueryHandler<GetPathQuery> {
  private pathComputer: PathComputer;

  constructor(
    private readonly swapOrderProvider: SwapOrderComputer,
    private readonly bridgeOrderProvider: BridgeOrderComputer,
    private readonly aggregatorOrderProvider: AggregatorOrderComputer,
    @Inject(Class.TokenDetailsFetcher) private readonly tokenDetailsFetcher: TokenDetailsFetcher,
    @Inject(Class.PriceFeedFetcher) private readonly priceFeedFetcher: PriceFeedFetcher,
    @Inject(Class.GasPriceFetcher) private readonly gasPriceFetcher: GasPriceFetcher,
  ) {
    this.pathComputer = new PathComputer(
      swapOrderProvider,
      bridgeOrderProvider,
      aggregatorOrderProvider,
      tokenDetailsFetcher,
      priceFeedFetcher,
      gasPriceFetcher,
    );
  }

  async execute(query: GetPathQuery): Promise<Path> {
    if (query.isMonoChain) {
      return this.singleStepPath(query);
    } else {
      return this.multiStepPath(query);
    }
  }

  /**
   * Compose a path with a single swap step
   * @param query
   * @private
   */
  private async singleStepPath(query: GetPathQuery): Promise<Path> {
    const srcToken = await this.tokenDetailsFetcher.fetch(query.srcToken, query.fromChainId);
    const dstToken = await this.tokenDetailsFetcher.fetch(query.dstToken, query.toChainId);
    const amountIn = BigInteger.fromDecimal(query.amountIn, srcToken.decimals);

    const swapRequest = new SwapRequest(query.fromChainId, srcToken, dstToken, amountIn);

    let swapOrder: SwapOrder;
    try {
      swapOrder = await this.swapOrderProvider.execute(ExchangeProviders.ZeroEx, swapRequest);
    } catch (e) {
      throw new PathNotFound();
    }

    const gasPriceOrigin = await this.gasPriceFetcher.fetch(query.fromChainId);
    const priceOriginCoin = await this.priceFeedFetcher.fetch(query.fromChainId);
    const zero = BigInteger.zero();

    return new Path(
      swapOrder,
      BridgingOrder.notRequired(),
      SwapOrder.notRequired(),
      zero,
      gasPriceOrigin,
      zero,
      priceOriginCoin,
      PriceFeed.zero(),
    );
  }

  /**
   * Compose a path with a multichain cross swap
   * @param query
   * @private
   */
  private async multiStepPath(query: GetPathQuery): Promise<Path> {
    return this.pathComputer.compute(query);
  }
}
