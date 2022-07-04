import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPathQuery } from './get-path.query';
import { Path } from '../../domain/Path';
import { GetSwapOrder } from '../../../swaps/application/query/get-swap-order';
import { SwapRequest } from '../../../swaps/domain/SwapRequest';
import { GetBridgingOrder } from '../../../bridges/application/query/get-bridging-order';
import { BridgingRequest } from '../../../bridges/domain/BridgingRequest';
import { Tokens } from '../../../shared/enums/Tokens';
import { ContractAddress } from '../../../shared/types';
import { RouterAddressFetcher } from '../../../addresses/application/query/RouterAddressFetcher';
import { SwapOrder } from '../../../swaps/domain/SwapOrder';
import { BridgingOrder } from '../../../bridges/domain/BridgingOrder';
import { TokenDetailsFetcher } from '../../../shared/infrastructure/TokenDetailsFetcher';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { BigInteger } from '../../../shared/domain/BigInteger';
import { BigNumber } from 'ethers';
import { PriceFeedConverter } from '../../../shared/infrastructure/PriceFeedConverter';

@QueryHandler(GetPathQuery)
export class GetPathHandler implements IQueryHandler<GetPathQuery> {
  constructor(
    private readonly routerAddressFetcher: RouterAddressFetcher,
    private readonly swapOrderProvider: GetSwapOrder,
    private readonly bridgeOrderProvider: GetBridgingOrder,
    @Inject(Class.TokenDetailsFetcher)
    private readonly tokenDetailsFetcher: TokenDetailsFetcher,
    @Inject(Class.PriceFeedConverter)
    private readonly priceFeedConverter: PriceFeedConverter,
  ) {}

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
    const srcToken = await this.tokenDetailsFetcher.fetch(
      query.srcToken,
      query.fromChainId,
    );
    const dstToken = await this.tokenDetailsFetcher.fetch(
      query.dstToken,
      query.toChainId,
    );
    const amountIn = BigInteger.fromDecimal(query.amountIn, srcToken.decimals);

    const swapRequest = new SwapRequest(
      query.fromChainId,
      srcToken,
      dstToken,
      amountIn,
    );

    const swapOrder = await this.swapOrderProvider.execute(swapRequest);

    const router = await this.getRouter();

    return new Path(
      router,
      swapOrder,
      BridgingOrder.notRequired(),
      SwapOrder.notRequired(),
      BigNumber.from(0),
    );
  }

  /**
   * Compose a path with a multichain cross swap
   * @param query
   * @private
   */
  private async multiStepPath(query: GetPathQuery): Promise<Path> {
    /** Origin swap **/

    const srcToken = await this.tokenDetailsFetcher.fetch(
      query.srcToken,
      query.fromChainId,
    );
    const originBridgingToken = Tokens.USDC[query.fromChainId];
    const amountIn = BigInteger.fromDecimal(query.amountIn, srcToken.decimals);

    let originSwapOrder;
    let bridgingAmount;

    if (
      srcToken.address.toLowerCase() ===
      originBridgingToken.address.toLowerCase()
    ) {
      originSwapOrder = SwapOrder.notRequired();
      bridgingAmount = amountIn;
    } else {
      const originSwapRequest = new SwapRequest(
        query.fromChainId,
        srcToken,
        originBridgingToken,
        amountIn,
      );
      originSwapOrder = await this.swapOrderProvider.execute(originSwapRequest);
      bridgingAmount = originSwapOrder.buyAmount;
    }

    /** Bridge **/

    const bridgeRequest = new BridgingRequest(
      query.fromChainId,
      query.toChainId,
      Tokens.USDC[query.fromChainId],
      bridgingAmount,
    );

    const bridgingOrder = await this.bridgeOrderProvider.execute(bridgeRequest);

    if (bridgingAmount.greaterThan(bridgingOrder.bigAmountThreshold)) {
      // TODO : It can be done, but alert it can take very long
    }

    const destinationReceivedAmount = bridgingOrder.amountOut;

    /** Destination swap **/

    const dstToken = await this.tokenDetailsFetcher.fetch(
      query.dstToken,
      query.toChainId,
    );

    let destinationSwapOrder: SwapOrder;
    if (
      dstToken.address.toLowerCase() ===
      bridgingOrder.tokenOut.address.toLowerCase()
    ) {
      destinationSwapOrder = SwapOrder.sameToken(dstToken);
    } else {
      const destinationSwapRequest = new SwapRequest(
        query.toChainId,
        bridgingOrder.tokenOut,
        dstToken,
        destinationReceivedAmount,
      );

      destinationSwapOrder = await this.swapOrderProvider.execute(
        destinationSwapRequest,
      );
    }

    // Add base gas for destination swap
    const fixDestinationGas = BigNumber.from(0);

    const estimatedDestinationGas =
      destinationSwapOrder.estimatedGas.add(fixDestinationGas);

    const nativeCoinDestinationFee = await this.priceFeedConverter.fetch(
      query.fromChainId,
      query.toChainId,
      estimatedDestinationGas,
    );

    /** Compose path **/

    const router = await this.getRouter();

    return new Path(
      router,
      originSwapOrder,
      bridgingOrder,
      destinationSwapOrder,
      nativeCoinDestinationFee,
    );
  }

  private async getRouter(): Promise<ContractAddress> {
    return await this.routerAddressFetcher.getAddress();
  }
}
