import { USDC } from '../../shared/enums/TokenSymbols';
import { GetPathQuery } from '../application/query/get-path.query';
import { SwapRequest } from '../../swaps/domain/SwapRequest';
import { Tokens } from '../../shared/enums/Tokens';
import { Token } from '../../shared/domain/Token';
import { BigInteger } from '../../shared/domain/BigInteger';
import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { TokenDetailsFetcher } from '../../shared/infrastructure/TokenDetailsFetcher';
import { BridgeOrderComputer } from '../../bridges/application/query/bridge-order-computer';
import { SwapOrderComputer } from '../../swaps/application/query/swap-order-computer';
import { BridgingRequest } from '../../bridges/domain/bridging-request';
import { PathNotFound } from './path-not-found';
import { flatten } from 'lodash';
import { PriceFeedFetcher } from '../../shared/infrastructure/PriceFeedFetcher';
import { GasPriceFetcher } from '../../shared/infrastructure/GasPriceFetcher';
import { GasConverter } from '../../shared/domain/GasConverter';
import { PriceFeed } from '../../shared/domain/PriceFeed';
import { AggregatorOrderComputer } from '../../aggregators/application/query/aggregator-order-computer';
import { AggregatorRequest } from '../../aggregators/domain/aggregator-request';
import { Route } from '../../shared/domain/route';
import { RouteStep } from '../../shared/domain/route-step';
import { TransactionDetails } from '../../shared/domain/transaction-details';
import { DeployedAddresses } from '../../shared/DeployedAddresses';
import { RouterCallEncoder } from '../../shared/domain/router-call-encoder';

export class PathComputer {
  /** Providers */
  private readonly swapOrderProvider: SwapOrderComputer;
  private readonly bridgeOrderProvider: BridgeOrderComputer;
  private readonly aggregatorOrderProvider: AggregatorOrderComputer;
  private readonly tokenDetailsFetcher: TokenDetailsFetcher;
  private readonly priceFeedFetcher: PriceFeedFetcher;
  private readonly gasPriceFetcher: GasPriceFetcher;
  private readonly gasConverter: GasConverter;
  private readonly routerCallEncoder: RouterCallEncoder;
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
  /** Result */
  private routes: Route[];

  constructor(
    _swapOrderProvider: SwapOrderComputer,
    _bridgeOrderProvider: BridgeOrderComputer,
    _aggregatorOrderProvider: AggregatorOrderComputer,
    _tokenDetailsFetcher: TokenDetailsFetcher,
    _priceFeedFetcher: PriceFeedFetcher,
    _gasPriceFetcher: GasPriceFetcher,
  ) {
    this.swapOrderProvider = _swapOrderProvider;
    this.bridgeOrderProvider = _bridgeOrderProvider;
    this.aggregatorOrderProvider = _aggregatorOrderProvider;
    this.tokenDetailsFetcher = _tokenDetailsFetcher;
    this.priceFeedFetcher = _priceFeedFetcher;
    this.gasPriceFetcher = _gasPriceFetcher;
    this.gasConverter = new GasConverter();
    this.routerCallEncoder = new RouterCallEncoder();
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

    this.gasPriceOrigin = await this.gasPriceFetcher.fetch(this.fromChain);
    this.gasPriceDestination = await this.gasPriceFetcher.fetch(this.toChain);
    this.priceOriginCoin = await this.priceFeedFetcher.fetch(this.fromChain);
    this.priceDestinationCoin = await this.priceFeedFetcher.fetch(this.toChain);

    const promiseComputedRoutes = this.getComputedProviderRoutes();
    const promiseAggregatorRoutes = this.getAggregatorsRoutes();

    this.routes = flatten(await Promise.all([promiseComputedRoutes, promiseAggregatorRoutes]));

    if (this.routes.length === 0) {
      throw new PathNotFound();
    }

    return this.routes;
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
    );
    const promises = [];
    // for every integrated aggregator
    for (const aggregatorId of this.getPossibleAggregators()) {
      // ask for their routes
      const promiseRoute = this.aggregatorOrderProvider.execute(aggregatorId, aggregatorRequest);
      promises.push(promiseRoute);
    }

    // resolve promises and flatten results
    return flatten(await Promise.all(promises));
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
      let bridgeAmountIn;
      // check the amount that should input the bridge
      if (originSwap.required) {
        bridgeAmountIn = originSwap.buyAmount;
      } else {
        bridgeAmountIn = this.amountIn;
      }
      // get the promise of the bridge order
      const bridgeOrderPromise = this.getBridgeOrder(bridgeId, bridgingAsset, bridgeAmountIn);
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
        bridgeOrder.amountOut,
      );
      // save the promise
      promises.push(swapOrderPromise);
    }
    // resolve all promises in order to create the routes
    return (await Promise.all(promises))
      .map((order) => {
        if (order) {
          // in case there is a possible swap
          return this.createRoute(originSwap, bridgeOrder, order);
        }
      })
      .filter((route) => {
        // filters out cases where no destination swap exists
        return route !== undefined;
      });
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
    // select amount out

    let amountOut;
    if (destinationSwap.required) {
      amountOut = destinationSwap.buyAmount.toDecimal(destinationSwap.tokenOut.decimals);
    } else if (bridge.required) {
      amountOut = bridge.amountOutDecimal;
    } else {
      amountOut = originSwap.buyAmount.toDecimal(originSwap.tokenOut.decimals);
    }

    // create the required steps of the route

    const steps = [];
    if (originSwap.required) {
      const fee = originSwap.estimatedGas
        .times(this.gasPriceOrigin)
        .times(this.priceOriginCoin.lastPrice)
        .div(BigInteger.weiInEther())
        .toDecimal(this.priceOriginCoin.decimals);

      const name = '';
      const logo = '';
      steps.push(RouteStep.swap(name, logo, originSwap.tokenIn, originSwap.tokenOut, fee));
    }

    if (bridge.required) {
      const name = '';
      const logo = '';
      steps.push(RouteStep.bridge(name, logo, bridge.tokenIn, bridge.tokenOut, bridge.decimalFee));
    }

    if (destinationSwap.required) {
      const fee = destinationSwap.estimatedGas
        .times(this.gasPriceOrigin)
        .times(this.priceOriginCoin.lastPrice)
        .div(BigInteger.weiInEther())
        .toDecimal(this.priceOriginCoin.decimals);

      const name = '';
      const logo = '';
      steps.push(
        RouteStep.swap(name, logo, destinationSwap.tokenIn, destinationSwap.tokenOut, fee),
      );
    }

    // create transaction details

    const callData = this.routerCallEncoder.encode(
      this.amountIn,
      originSwap,
      bridge,
      destinationSwap,
    );

    const originNativeWeiOfDestinationGas =
      this.convertDestinationGasIntoOriginNative(destinationSwap);

    let value = originNativeWeiOfDestinationGas;

    if (originSwap.tokenIn.isNative()) {
      value = originNativeWeiOfDestinationGas.plus(this.amountIn);
    }

    const transactionDetails = new TransactionDetails(
      DeployedAddresses.Router,
      callData,
      value,
      BigInteger.fromString('2000000'), // TODO set more accurate
      this.gasPriceOrigin,
    );

    return new Route(amountOut, transactionDetails, steps);
  }

  /**
   * Creates a SwapOrder given the details
   * @param exchangeId ID of exchange to use
   * @param chainId ID of chain
   * @param tokenIn Token that goes in
   * @param tokenOut Token that goes out
   * @param amount Amount to swap
   * @private
   */
  private async getSwapOrder(
    exchangeId: string,
    chainId: string,
    tokenIn: Token,
    tokenOut: Token,
    amount: BigInteger,
  ): Promise<SwapOrder> {
    let swapOrder;
    // if the input and output asset are the same...
    if (tokenIn.equals(tokenOut)) {
      // no need to swap
      swapOrder = SwapOrder.sameToken(tokenIn);
    } else {
      // otherwise compute swap
      const swapRequest = new SwapRequest(chainId, tokenIn, tokenOut, amount);
      try {
        swapOrder = await this.swapOrderProvider.execute(exchangeId, swapRequest);
      } catch (e) {
        // no possible path, nothing to do ..
      }
    }
    return swapOrder;
  }

  /**
   * Returns a possible bridge order
   * @param providerId ID of bridge provider to use
   * @param asset The asset that we want to send across the bridge
   * @param bridgeAmountIn The amount that we want to cross
   * @private
   */
  private async getBridgeOrder(
    providerId: string,
    asset: string,
    bridgeAmountIn: BigInteger,
  ): Promise<BridgingOrder> {
    const bridgeTokenIn = Tokens[asset][this.fromChain];
    const bridgeRequest = new BridgingRequest(
      this.fromChain,
      this.toChain,
      bridgeTokenIn,
      bridgeAmountIn,
    );
    try {
      return await this.bridgeOrderProvider.execute(providerId, bridgeRequest);
    } catch (e) {
      // not possible, nothing to do..
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
    return this.swapOrderProvider.getEnabledExchanged(chainId);
  }

  /**
   * Returns the available exchanges given the origin/destination chain combination
   * @private
   */
  private getPossibleBridges(): string[] {
    return this.bridgeOrderProvider.getEnabledBridges(this.fromChain, this.toChain);
  }

  /**
   * Returns the available aggregators given the origin/destination chain combination
   * @private
   */
  private getPossibleAggregators(): string[] {
    return this.aggregatorOrderProvider.getEnabledAggregators(this.fromChain, this.toChain);
  }
}
