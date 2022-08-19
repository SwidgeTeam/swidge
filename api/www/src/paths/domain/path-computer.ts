import { USDC } from '../../shared/enums/TokenSymbols';
import { GetPathQuery } from '../application/query/get-path.query';
import { SwapRequest } from '../../swaps/domain/swap-request';
import { Tokens } from '../../shared/enums/Tokens';
import { Token } from '../../shared/domain/token';
import { BigInteger } from '../../shared/domain/big-integer';
import { SwapOrder } from '../../swaps/domain/swap-order';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { TokenDetailsFetcher } from '../../shared/infrastructure/TokenDetailsFetcher';
import { BridgingRequest } from '../../bridges/domain/bridging-request';
import { PathNotFound } from './path-not-found';
import { flatten } from 'lodash';
import { GasConverter } from '../../shared/domain/gas-converter';
import { PriceFeed } from '../../shared/domain/PriceFeed';
import { AggregatorRequest } from '../../aggregators/domain/aggregator-request';
import { Route } from '../../shared/domain/route/route';
import { RouteStep } from '../../shared/domain/route/route-step';
import { TransactionDetails } from '../../shared/domain/route/transaction-details';
import { DeployedAddresses } from '../../shared/DeployedAddresses';
import { RouterCallEncoder } from '../../shared/domain/router-call-encoder';
import { BridgeDetails, BridgeProviders } from '../../bridges/domain/providers/bridge-providers';
import { ExchangeDetails } from '../../swaps/domain/providers/exchange-providers';
import { OrderStrategy } from './route-order-strategy/order-strategy';
import { RouteResume } from '../../shared/domain/route/route-resume';
import { Bridges } from '../../bridges/domain/bridges';
import { Exchanges } from '../../swaps/domain/exchanges';
import { Aggregators } from '../../aggregators/domain/aggregators';
import { Logger } from '../../shared/domain/logger';
import { AggregatorProviders } from '../../aggregators/domain/providers/aggregator-providers';
import { AggregatorDetails } from '../../shared/domain/aggregator-details';
import { ApprovalTransactionDetails } from '../../shared/domain/route/approval-transaction-details';
import { RouteFees } from '../../shared/domain/route/route-fees';
import { IGasPriceFetcher } from '../../shared/domain/gas-price-fetcher';
import { IPriceFeedFetcher } from '../../shared/domain/price-feed-fetcher';

export class PathComputer {
  /** Providers */
  private readonly exchanges: Exchanges;
  private readonly bridges: Bridges;
  private readonly aggregators: Aggregators;
  private readonly tokenDetailsFetcher: TokenDetailsFetcher;
  private readonly priceFeedFetcher: IPriceFeedFetcher;
  private readonly gasPriceFetcher: IGasPriceFetcher;
  private readonly gasConverter: GasConverter;
  private readonly routerCallEncoder: RouterCallEncoder;
  private readonly logger: Logger;
  /** Details */
  private readonly bridgingAssets;
  private srcToken: Token;
  private dstToken: Token;
  private fromChain: string;
  private toChain: string;
  private amountIn: BigInteger;
  private priceOriginCoin: PriceFeed;
  private priceDestinationCoin: PriceFeed;
  private gasPriceDestination: BigInteger;
  private gasPriceOrigin: BigInteger;
  private totalSlippage: number;
  private originSlippage: number;
  private destinationSlippage: number;
  private senderAddress: string;
  private receiverAddress: string;

  constructor(
    _exchanges: Exchanges,
    _bridges: Bridges,
    _aggregators: Aggregators,
    _tokenDetailsFetcher: TokenDetailsFetcher,
    _priceFeedFetcher: IPriceFeedFetcher,
    _gasPriceFetcher: IGasPriceFetcher,
    _logger: Logger,
  ) {
    this.exchanges = _exchanges;
    this.bridges = _bridges;
    this.aggregators = _aggregators;
    this.tokenDetailsFetcher = _tokenDetailsFetcher;
    this.priceFeedFetcher = _priceFeedFetcher;
    this.gasPriceFetcher = _gasPriceFetcher;
    this.gasConverter = new GasConverter();
    this.routerCallEncoder = new RouterCallEncoder();
    this.logger = _logger;
    this.bridgingAssets = [USDC];
  }

  /**
   * Computes the routes
   * @param query
   */
  public async compute(query: GetPathQuery) {
    this.fromChain = query.fromChainId;
    this.toChain = query.toChainId;
    this.srcToken = await this.tokenDetailsFetcher.fetch(query.srcToken, this.fromChain);
    this.dstToken = await this.tokenDetailsFetcher.fetch(query.dstToken, this.toChain);
    this.amountIn = BigInteger.fromDecimal(query.amountIn, this.srcToken.decimals);
    this.totalSlippage = query.slippage;
    this.originSlippage = query.slippage / 2;
    this.destinationSlippage = query.slippage / 2;
    this.senderAddress = query.senderAddress;
    this.receiverAddress = query.receiverAddress;

    this.gasPriceOrigin = await this.gasPriceFetcher.fetch(this.fromChain);
    this.gasPriceDestination = await this.gasPriceFetcher.fetch(this.toChain);
    this.priceOriginCoin = await this.priceFeedFetcher.fetch(this.fromChain);
    this.priceDestinationCoin = await this.priceFeedFetcher.fetch(this.toChain);

    const promiseComputedRoutes = this.getComputedProviderRoutes();
    const promiseAggregatorRoutes = this.getAggregatorsRoutes();

    const routes = flatten(await Promise.all([promiseComputedRoutes, promiseAggregatorRoutes]));

    if (routes.length === 0) {
      throw new PathNotFound();
    }

    const orderStrategy = OrderStrategy.get(OrderStrategy.HIGHEST_RETURN);

    return orderStrategy.order(routes);
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
      // ask for their routes
      const promiseRoute = this.aggregators.execute(
        aggregatorId,
        aggregatorRequest,
        this.gasPriceOrigin,
        this.priceOriginCoin,
      );
      promises.push(promiseRoute);
    }

    // resolve promises and flatten results
    const results = (await Promise.allSettled(promises))
      .filter((result) => result.status === 'fulfilled')
      .map((result: PromiseFulfilledResult<Route>) => result.value);
    return flatten(results);
  }

  /**
   * Compute all the possible routes from the origin chain/asset
   * to the destination chain/asset using all fundamental providers
   * @private
   */
  private async getComputedProviderRoutes(): Promise<Route[]> {
    if (this.fromChain === this.toChain) {
      return this.singleChainOriginSwap();
    } else {
      // the entrypoint to the algorithm is to compute all the possible origin swaps,
      // the function itself then forwards to the next steps(bridge + destinationSwap).
      // so from this point of view, we only call `originSwap`
      return this.multiChainOriginSwap();
    }
  }

  /**
   * Computes all the possible swaps on a single chain
   * @private
   */
  private async singleChainOriginSwap(): Promise<Route[]> {
    const promises = [];
    // for every enabled exchange on the origin chain
    for (const exchangeId of this.getPossibleExchanges(this.fromChain)) {
      // and create a possible path
      const swapOrderPromise = this.getSwapOrder(
        exchangeId,
        this.fromChain,
        this.srcToken,
        this.dstToken,
        this.totalSlippage,
        this.amountIn,
        this.amountIn,
      );
      // aggregate promises
      promises.push(swapOrderPromise);
    }
    // resolve all promises in order to create the routes
    return (await Promise.all(promises))
      .map((order) => {
        if (order) {
          // in case there is a possible swap
          return this.createRoute(order, BridgingOrder.notRequired(), SwapOrder.notRequired());
        }
      })
      .filter((route) => {
        // filters out cases where no destination swap exists
        return route !== undefined;
      });
  }

  /**
   * Computes all the possible swaps on the origin chain to
   * the different bridgeable assets, and forwards to the bridging function
   * @private
   */
  private async multiChainOriginSwap(): Promise<Route[]> {
    const promises = [];
    // for every enabled exchange on the origin chain
    for (const exchangeId of this.getPossibleExchanges(this.fromChain)) {
      // check every enabled bridgeable asset
      for (const bridgingAsset of this.bridgingAssets) {
        // and create a possible path
        const bridgeTokenIn = Tokens[bridgingAsset][this.fromChain];
        const swapOrderPromise = this.getSwapOrder(
          exchangeId,
          this.fromChain,
          this.srcToken,
          bridgeTokenIn,
          this.originSlippage,
          this.amountIn,
          this.amountIn,
        );
        // get the promise of the routes for this path
        const routesPromise = this.bridge(bridgingAsset, swapOrderPromise);
        // aggregate promises
        promises.push(routesPromise);
      }
    }
    // resolve promises and flatten results
    return flatten(await Promise.all(promises));
  }

  /**
   * For a given swap, it computes all the possible bridging solutions,
   * then forwards to the destination swap function
   * @private
   */
  private async bridge(
    bridgingAsset: string,
    swapOrderPromise: Promise<SwapOrder>,
  ): Promise<Route[]> {
    const originSwap = await swapOrderPromise;
    if (!originSwap) {
      return [];
    }
    let promises = [];
    // for every usable bridge
    for (const bridgeId of this.getPossibleBridges()) {
      // add the possible bridge order
      let bridgeAmountIn, minBridgeAmountIn;
      // check the amount that should input the bridge
      if (originSwap.required) {
        bridgeAmountIn = originSwap.expectedAmountOut;
        minBridgeAmountIn = originSwap.worstCaseAmountOut;
      } else {
        bridgeAmountIn = this.amountIn;
        minBridgeAmountIn = this.amountIn;
      }
      // get the promise of the bridge order
      const bridgeOrderPromise = this.getBridgeOrder(
        bridgeId,
        bridgingAsset,
        bridgeAmountIn,
        minBridgeAmountIn,
      );
      // get the promise of the possible routes
      const routesPromise = this.destinationSwap(originSwap, bridgeOrderPromise);
      // aggregate promises
      promises = promises.concat(routesPromise);
    }
    // resolve promises and flatten results
    return flatten(await Promise.all(promises));
  }

  /**
   * For every combination of swap+bridge orders, it computes the possible destination swap
   * @dev Returns only the possible routes given the whole set of steps
   * @private
   */
  private async destinationSwap(
    originSwap: SwapOrder,
    bridgeOrderPromise: Promise<BridgingOrder>,
  ): Promise<Route[]> {
    // wait for the given order bridge to complete
    const bridgeOrder = await bridgeOrderPromise;
    if (!bridgeOrder) {
      return [];
    }
    const promises = [];
    // for every enabled exchange on the destination chain
    for (const exchangeId of this.getPossibleExchanges(this.toChain)) {
      // check each combination (exchange+bridge)
      // in order to compute the destination swap
      const swapOrderPromise = this.getSwapOrder(
        exchangeId,
        this.toChain,
        bridgeOrder.tokenOut,
        this.dstToken,
        this.destinationSlippage,
        bridgeOrder.expectedAmountOut,
        bridgeOrder.worstCaseAmountOut,
      );
      // save the promise
      promises.push(swapOrderPromise);
    }
    // resolve all promises in order to create the routes
    return (await Promise.all(promises))
      .map((order: SwapOrder) => {
        if (order) {
          // in case there is a possible swap
          return this.createRoute(originSwap, bridgeOrder, order);
        }
      })
      .filter((route) => {
        // filters out cases where no destination swap exists
        return route !== undefined;
      })
      .reduce((final, current) => {
        // make sure there is no duplicates, may happen when various path dont need all the steps
        const exists = final.find((route: Route) => {
          return (
            route.transaction.to === current.transaction.to &&
            route.transaction.callData === current.transaction.callData &&
            route.resume.amountOut.equals(current.resume.amountOut)
          );
        });
        if (!exists) {
          return final.concat([current]);
        } else {
          return final;
        }
      }, []);
  }

  /**
   *
   * @param originSwap
   * @param bridge
   * @param destinationSwap
   * @private
   */
  private createRoute(
    originSwap: SwapOrder,
    bridge: BridgingOrder,
    destinationSwap: SwapOrder,
  ): Route {
    let minAmountOut: BigInteger;

    // create the required steps of the route
    const steps: RouteStep[] = [];
    if (originSwap.required) {
      const fee = this.computeUSDFee(
        originSwap.estimatedGas,
        this.gasPriceOrigin,
        this.priceOriginCoin,
      );

      const details = ExchangeDetails.get(originSwap.providerCode);
      steps.push(
        RouteStep.swap(
          details,
          originSwap.tokenIn,
          originSwap.tokenOut,
          originSwap.amountIn,
          originSwap.expectedAmountOut,
          fee,
        ),
      );
      minAmountOut = originSwap.worstCaseAmountOut;
    }

    if (bridge.required) {
      const details = BridgeDetails.get(BridgeProviders.Multichain);
      steps.push(
        RouteStep.bridge(
          details,
          bridge.tokenIn,
          bridge.tokenOut,
          bridge.amountIn,
          bridge.expectedAmountOut,
          bridge.decimalFee,
        ),
      );

      minAmountOut = bridge.worstCaseAmountOut;
    }

    if (destinationSwap.required) {
      const fee = this.computeUSDFee(
        destinationSwap.estimatedGas,
        this.gasPriceDestination,
        this.priceDestinationCoin,
      );

      const details = ExchangeDetails.get(destinationSwap.providerCode);
      steps.push(
        RouteStep.swap(
          details,
          destinationSwap.tokenIn,
          destinationSwap.tokenOut,
          destinationSwap.amountIn,
          destinationSwap.expectedAmountOut,
          fee,
        ),
      );

      minAmountOut = destinationSwap.worstCaseAmountOut;
    }

    // create transaction details

    const callData = this.routerCallEncoder.encodeInitSwidge(
      this.amountIn,
      originSwap,
      bridge,
      destinationSwap,
      this.receiverAddress,
    );

    const originNativeWeiOfDestinationGas =
      this.fromChain === this.toChain
        ? BigInteger.zero()
        : this.convertDestinationGasIntoOriginNative(destinationSwap);

    let value = originNativeWeiOfDestinationGas;

    if (originSwap.tokenIn.isNative()) {
      value = originNativeWeiOfDestinationGas.plus(this.amountIn);
    }

    const approvalTransaction = this.srcToken.isNative()
      ? null
      : new ApprovalTransactionDetails(
          this.srcToken.address,
          this.routerCallEncoder.encodeApproval(DeployedAddresses.Router, this.amountIn),
        );

    const transactionDetails = new TransactionDetails(
      DeployedAddresses.Router,
      callData,
      value,
      BigInteger.fromString('2000000'), // TODO set more accurate
    );

    const resume = new RouteResume(
      this.fromChain,
      this.toChain,
      this.srcToken,
      this.dstToken,
      this.amountIn,
      steps[steps.length - 1].amountOut,
      minAmountOut,
    );

    const totalFeeInUsd = steps.reduce((fee: number, current: RouteStep) => {
      return fee + Number(current.feeInUSD);
    }, 0);

    const fees = new RouteFees(BigInteger.zero(), totalFeeInUsd.toString());

    const aggregatorDetails = new AggregatorDetails(AggregatorProviders.Swidge);

    return new Route(
      aggregatorDetails,
      resume,
      steps,
      fees,
      approvalTransaction,
      transactionDetails,
    );
  }

  /**
   * Computes and returns the USD value of the given gas
   * @param estimatedGas
   * @param gasPrice
   * @param coinPrice
   * @private
   */
  private computeUSDFee(
    estimatedGas: BigInteger,
    gasPrice: BigInteger,
    coinPrice: PriceFeed,
  ): string {
    return estimatedGas
      .times(gasPrice)
      .times(coinPrice.lastPrice)
      .div(BigInteger.weiInEther())
      .toDecimal(coinPrice.decimals);
  }

  /**
   * Creates a SwapOrder given the details
   * @param exchangeId ID of exchange to use
   * @param chainId ID of chain
   * @param tokenIn Token that goes in
   * @param tokenOut Token that goes out
   * @param slippage Max amount of slippage allowed
   * @param amountIn Expected amount to swap
   * @param minAmountIn Minimum amount that will get to the swap
   * @private
   */
  private async getSwapOrder(
    exchangeId: string,
    chainId: string,
    tokenIn: Token,
    tokenOut: Token,
    slippage: number,
    amountIn: BigInteger,
    minAmountIn: BigInteger,
  ): Promise<SwapOrder> {
    let swapOrder;
    // if the input and output asset are the same...
    if (tokenIn.equals(tokenOut)) {
      // no need to swap
      swapOrder = SwapOrder.sameToken(tokenIn);
    } else {
      // otherwise compute swap
      const swapRequest = new SwapRequest(
        chainId,
        tokenIn,
        tokenOut,
        slippage,
        amountIn,
        minAmountIn,
      );
      try {
        swapOrder = await this.exchanges.execute(exchangeId, swapRequest);
      } catch (e) {
        // no possible path, nothing to do ..
        this.logger.warn(e);
      }
    }
    return swapOrder;
  }

  /**
   * Returns a possible bridge order
   * @param providerId ID of bridge provider to use
   * @param asset The asset that we want to send across the bridge
   * @param bridgeAmountIn The amount that we expect will get to the bridge
   * @param minBridgeAmountIn The minimum amount that we know can get to the bridge
   * @private
   */
  private async getBridgeOrder(
    providerId: string,
    asset: string,
    bridgeAmountIn: BigInteger,
    minBridgeAmountIn: BigInteger,
  ): Promise<BridgingOrder> {
    const bridgeTokenIn = Tokens[asset][this.fromChain];
    const bridgeRequest = new BridgingRequest(
      this.fromChain,
      this.toChain,
      bridgeTokenIn,
      bridgeAmountIn,
      minBridgeAmountIn,
    );
    try {
      return await this.bridges.execute(providerId, bridgeRequest);
    } catch (e) {
      // not possible, nothing to do..
      this.logger.warn(e);
    }
  }

  /**
   * Converts the estimated cost of the destination execution into native origin coin
   * @private
   */
  private convertDestinationGasIntoOriginNative(destinationSwap: SwapOrder): BigInteger {
    const fixDestinationGas = BigInteger.zero();

    const destinationEstimatedGas = destinationSwap.estimatedGas.plus(fixDestinationGas);

    return this.gasConverter.convert(
      destinationEstimatedGas,
      this.gasPriceDestination,
      this.priceOriginCoin.lastPrice,
      this.priceDestinationCoin.lastPrice,
    );
  }

  /**
   * Returns the available exchanges on a given chain
   * @param chainId
   * @private
   */
  private getPossibleExchanges(chainId: string): string[] {
    return this.exchanges.getEnabled(chainId);
  }

  /**
   * Returns the available exchanges given the origin/destination chain combination
   * @private
   */
  private getPossibleBridges(): string[] {
    return this.bridges.getEnabled(this.fromChain, this.toChain);
  }

  /**
   * Returns the available aggregators given the origin/destination chain combination
   * @private
   */
  private getPossibleAggregators(): string[] {
    return this.aggregators.getEnabled(this.fromChain, this.toChain);
  }
}
