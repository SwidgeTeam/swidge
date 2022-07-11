import { USDC } from '../../shared/enums/TokenSymbols';
import { GetPathQuery } from '../application/query/get-path.query';
import { SwapRequest } from '../../swaps/domain/SwapRequest';
import { Tokens } from '../../shared/enums/Tokens';
import { Token } from '../../shared/domain/Token';
import { BigInteger } from '../../shared/domain/BigInteger';
import { PossiblePath } from './possible-path';
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
  private possiblePaths: PossiblePath[]; // Initial incomplete paths
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

    await this.originSwap();
    await this.bridge();
    await this.destinationSwap();

    const candidate = await this.getBestCandidate();

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
  private async originSwap() {
    // for every enabled exchange on the origin chain
    for (const exchangeId of this.getPossibleExchanges(this.fromChain)) {
      // check every enabled bridgeable asset
      for (const bridgingAsset of this.bridgingAssets) {
        // and create a possible path
        const bridgeTokenIn = Tokens[bridgingAsset][this.fromChain];
        const swapRequest = new SwapRequest(
          this.fromChain,
          this.srcToken,
          bridgeTokenIn,
          this.amountIn,
        );
        const swapOrder = await this.swapOrderProvider.execute(exchangeId, swapRequest);
        const possiblePath = new PossiblePath(bridgingAsset, swapOrder);
        // store it
        this.possiblePaths.push(possiblePath);
      }
    }
  }

  /**
   * Adds the bridge step to the computed possible paths
   * @private
   */
  private async bridge() {
    // for every usable bridge
    for (const bridgeId of this.getPossibleBridges()) {
      // and every possible path
      for (const path of this.possiblePaths) {
        // add the possible bridge order
        const bridgingAsset = path.bridgingAsset;
        const swapAmountOut = path.originSwapAmountOut;
        const bridgeOrder = await this.getBridgeStep(bridgeId, bridgingAsset, swapAmountOut);
        path.withBridge(bridgeId, bridgeOrder);
      }
    }
  }

  /**
   * Iterates over all the possible combinations in order to compute
   * all the possible destination swaps
   * @private
   */
  private async destinationSwap() {
    // for every enabled exchange on the destination chain
    for (const swapperId of this.getPossibleExchanges(this.toChain)) {
      // and every possible path
      for (const path of this.possiblePaths) {
        // check each combination (exchange+bridge)
        path.forEachBridge(async (originSwap: SwapOrder, bridgeOrder: BridgingOrder) => {
          // in order to compute the destination swap
          const swapRequest = new SwapRequest(
            this.toChain,
            bridgeOrder.tokenOut,
            this.dstToken,
            bridgeOrder.amountOut,
          );
          const destinationSwap = await this.swapOrderProvider.execute(swapperId, swapRequest);
          // store the final combination
          this.candidatePaths.push(new CandidatePath(originSwap, bridgeOrder, destinationSwap));
        });
      }
    }
  }

  /**
   * Checks all the candidates to select the most optimal path
   * @private
   */
  private async getBestCandidate(): Promise<CandidatePath> {
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

  /**
   * Returns a possible bridge order
   * @param providerId ID of bridge provider to use
   * @param asset The asset that we want to send across the bridge
   * @param swapAmountOut The amount that we want to cross
   * @private
   */
  private async getBridgeStep(
    providerId: string,
    asset: string,
    swapAmountOut: BigInteger,
  ): Promise<BridgingOrder> {
    const bridgeTokenIn = Tokens[asset][this.toChain];
    const bridgeRequest = new BridgingRequest(
      this.fromChain,
      this.toChain,
      bridgeTokenIn,
      swapAmountOut,
    );
    return await this.bridgeOrderProvider.execute(providerId, bridgeRequest);
  }
}
