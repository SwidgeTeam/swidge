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
import { BigNumber } from 'ethers';
import { PriceFeedConverter } from '../../shared/infrastructure/PriceFeedConverter';
import { PathNotFound } from './path-not-found';
import { flatten } from 'lodash';

export class PathComputer {
  /** Providers */
  private readonly swapOrderProvider: SwapOrderComputer;
  private readonly bridgeOrderProvider: BridgeOrderComputer;
  private readonly tokenDetailsFetcher: TokenDetailsFetcher;
  private readonly priceFeedConverter: PriceFeedConverter;
  /** Details */
  private readonly bridgingAssets;
  private srcToken: Token;
  private dstToken: Token;
  private fromChain: string;
  private toChain: string;
  private amountIn: BigInteger;
  /** Result */
  private candidatePaths: CandidatePath[]; // Final candidate paths

  constructor(
    _swapOrderProvider: SwapOrderComputer,
    _bridgeOrderProvider: BridgeOrderComputer,
    _tokenDetailsFetcher: TokenDetailsFetcher,
    _priceFeedConverter: PriceFeedConverter,
  ) {
    this.swapOrderProvider = _swapOrderProvider;
    this.bridgeOrderProvider = _bridgeOrderProvider;
    this.tokenDetailsFetcher = _tokenDetailsFetcher;
    this.priceFeedConverter = _priceFeedConverter;
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

    this.candidatePaths = await this.originSwap();

    const candidate = this.getBestCandidate();

    if (!candidate) {
      throw new PathNotFound();
    }

    const nativeWei = await this.convertDestinationGasIntoOriginNative(candidate.destinationStep);

    return new Path(
      candidate.originStep,
      candidate.bridgeStep,
      candidate.destinationStep,
      nativeWei,
    );
  }

  /**
   * Computes all the possible paths from the origin asset
   * to the different bridgeable assets on all the possible exchanges
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
   * Adds the bridge step to the computed possible paths
   * @private
   */
  private async bridge(
    bridgingAsset: string,
    swapOrderPromise: Promise<SwapOrder>,
  ): Promise<CandidatePath[]> {
    let promises = [];
    const originSwap = await swapOrderPromise;
    if (originSwap) {
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
    }
    // resolve promises and flatten results
    return flatten(await Promise.all(promises));
  }

  /**
   * Iterates over all the possible combinations in order to compute
   * all the possible destination swaps
   * @private
   */
  private async destinationSwap(
    originSwap: SwapOrder,
    bridgeOrderPromise: Promise<BridgingOrder>,
  ): Promise<CandidatePath[]> {
    const promises = [];
    // wait for the given order bridge to complete
    const bridgeOrder = await bridgeOrderPromise;
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
    return (await Promise.all(promises)).map(
      (order) => new CandidatePath(originSwap, bridgeOrder, order),
    );
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
   * @param swapAmountOut The amount that we want to cross
   * @private
   */
  private async getBridgeOrder(
    providerId: string,
    asset: string,
    swapAmountOut: BigInteger,
  ): Promise<BridgingOrder> {
    const bridgeTokenIn = Tokens[asset][this.fromChain];
    const bridgeRequest = new BridgingRequest(
      this.fromChain,
      this.toChain,
      bridgeTokenIn,
      swapAmountOut,
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
  ): Promise<BigNumber> {
    const fixDestinationGas = BigNumber.from(0);

    const estimatedDestinationGas = destinationSwap.estimatedGas.add(fixDestinationGas);

    return await this.priceFeedConverter.fetch(
      this.fromChain,
      this.toChain,
      estimatedDestinationGas,
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
}
