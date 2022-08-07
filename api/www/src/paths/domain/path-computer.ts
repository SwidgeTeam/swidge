import { USDC } from '../../shared/enums/TokenSymbols';
import { GetPathQuery } from '../application/query/get-path.query';
import { SwapRequest } from '../../swaps/domain/SwapRequest';
import { Tokens } from '../../shared/enums/Tokens';
import { Token } from '../../shared/domain/Token';
import { BigInteger } from '../../shared/domain/BigInteger';
import { SwapOrder } from '../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../bridges/domain/bridging-order';
import { CandidatePath } from './candidate-path';
import { TokenDetailsFetcher } from '../../shared/infrastructure/TokenDetailsFetcher';
import { BridgeOrderComputer } from '../../bridges/application/query/bridge-order-computer';
import { SwapOrderComputer } from '../../swaps/application/query/swap-order-computer';
import { BridgingRequest } from '../../bridges/domain/bridging-request';
import { Path } from './path';
import { PathNotFound } from './path-not-found';
import { flatten } from 'lodash';
import { PriceFeedFetcher } from '../../shared/infrastructure/PriceFeedFetcher';
import { GasPriceFetcher } from '../../shared/infrastructure/GasPriceFetcher';
import { GasConverter } from '../../shared/domain/GasConverter';
import { PriceFeed } from '../../shared/domain/PriceFeed';
import { AggregatorOrderComputer } from '../../aggregators/application/query/aggregator-order-computer';
import { AggregatorRequest } from '../../aggregators/domain/aggregator-request';
import { Route } from './route';

export class PathComputer {
  /** Providers */
  private readonly swapOrderProvider: SwapOrderComputer;
  private readonly bridgeOrderProvider: BridgeOrderComputer;
  private readonly aggregatorOrderProvider: AggregatorOrderComputer;
  private readonly tokenDetailsFetcher: TokenDetailsFetcher;
  private readonly priceFeedFetcher: PriceFeedFetcher;
  private readonly gasPriceFetcher: GasPriceFetcher;
  private readonly gasConverter: GasConverter;
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
  private candidatePaths: CandidatePath[]; // Final candidate paths

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
    this.bridgingAssets = [USDC];
  }

  /**
   * Computes the candidate paths
   * @param query
   */
  public async compute(query: GetPathQuery) {
    this.fromChain = query.fromChainId;
    this.toChain = query.toChainId;
    this.srcToken = await this.tokenDetailsFetcher.fetch(query.srcToken, this.fromChain);
    this.dstToken = await this.tokenDetailsFetcher.fetch(query.dstToken, this.toChain);
    this.amountIn = BigInteger.fromDecimal(query.amountIn, this.srcToken.decimals);

    const promiseComputedCandidates = this.getComputedProviderCandidates();
    const promiseAggregatorCandidates = this.getAggregatorsCandidates();

    this.candidatePaths = flatten(
      await Promise.all([promiseComputedCandidates, promiseAggregatorCandidates]),
    );

    const candidate = this.getBestCandidate();

    if (!candidate) {
      throw new PathNotFound();
    }

    this.gasPriceOrigin = await this.gasPriceFetcher.fetch(this.fromChain);
    this.gasPriceDestination = await this.gasPriceFetcher.fetch(this.toChain);
    this.priceOriginCoin = await this.priceFeedFetcher.fetch(this.fromChain);
    this.priceDestinationCoin = await this.priceFeedFetcher.fetch(this.toChain);

    const nativeWei = await this.convertDestinationGasIntoOriginNative(candidate.destinationStep);

    return new Path(
      candidate.originStep,
      candidate.bridgeStep,
      candidate.destinationStep,
      nativeWei,
      this.gasPriceOrigin,
      this.gasPriceDestination,
      this.priceOriginCoin,
      this.priceDestinationCoin,
    );
  }

  /**
   * Fetches all the possible candidate paths
   * from the different aggregator providers
   * @private
   */
  private async getAggregatorsCandidates(): Promise<Route[]> {
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
      // ask for their candidates
      const promiseAggregatorOrder = this.aggregatorOrderProvider.execute(
        aggregatorId,
        aggregatorRequest,
      );
      promises.push(promiseAggregatorOrder);
    }

    // resolve promises and flatten results
    return flatten(await Promise.all(promises));
  }

  /**
   * Compute all the possible candidate path from the origin chain/asset
   * to the destination chain/asset using all fundamental providers
   * @private
   */
  private async getComputedProviderCandidates(): Promise<CandidatePath[]> {
    // the entrypoint to the algorithm is to compute all the possible origin swaps,
    // the function itself then forwards to the next steps(bridge + destinationSwap).
    // so from this point of view, we only call `originSwap`
    return this.originSwap();
  }

  /**
   * Computes all the possible swaps on the origin chain to
   * the different bridgeable assets, and forwards to the bridging function
   * @private
   */
  private async originSwap(): Promise<CandidatePath[]> {
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
        // get the promise of the candidates for this path
        const candidatesPromise = this.bridge(bridgingAsset, swapOrderPromise);
        // aggregate promises
        promises.push(candidatesPromise);
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
  ): Promise<CandidatePath[]> {
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
      // get the promise of the candidates for this path
      const candidatesPromise = this.destinationSwap(originSwap, bridgeOrderPromise);
      // aggregate promises
      promises = promises.concat(candidatesPromise);
    }
    // resolve promises and flatten results
    return flatten(await Promise.all(promises));
  }

  /**
   * For every combination of swap+bridge orders, it computes the possible destination swap
   * @dev Returns only the possible candidate paths given the whole set of steps
   * @private
   */
  private async destinationSwap(
    originSwap: SwapOrder,
    bridgeOrderPromise: Promise<BridgingOrder>,
  ): Promise<CandidatePath[]> {
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
    // resolve all promises in order to create the candidates
    return (await Promise.all(promises))
      .map((order) => {
        if (order) {
          // in case there is a possible swap
          return new CandidatePath(originSwap, bridgeOrder, order);
        }
      })
      .filter((candidate) => {
        // filters out cases where no destination swap exists
        return candidate !== undefined;
      });
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
   * Checks all the candidates to select the most optimal path
   * @private
   */
  private getBestCandidate(): CandidatePath {
    let currentMax = BigInteger.zero();
    let bestPath: CandidatePath;
    for (const candidate of this.candidatePaths) {
      if (candidate.amountOut.greaterThan(currentMax)) {
        currentMax = candidate.amountOut;
        bestPath = candidate;
      }
    }
    return bestPath;
  }

  /**
   *
   * @private
   */
  private async convertDestinationGasIntoOriginNative(
    destinationSwap: SwapOrder,
  ): Promise<BigInteger> {
    const fixDestinationGas = BigInteger.zero();

    const destinationEstimatedGas = destinationSwap.estimatedGas.plus(fixDestinationGas);

    return await this.gasConverter.convert(
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
