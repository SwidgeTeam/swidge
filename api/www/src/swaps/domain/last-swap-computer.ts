import { Exchanges } from './exchanges';
import { BigInteger } from '../../shared/domain/BigInteger';
import { SwapOrder } from './SwapOrder';
import { Token } from '../../shared/domain/Token';
import { SwapRequest } from './SwapRequest';
import { LastSwapComputeRequest } from './last-swap-compute-request';

export class LastSwapComputer {
  constructor(private readonly exchanges: Exchanges) {}

  /**
   * Entrypoint
   * @param chainId
   * @param srcToken
   * @param dstToken
   * @param amountIn
   * @param minAmountOut
   */
  public async compute({
    chainId,
    srcToken,
    dstToken,
    amountIn,
    minAmountOut,
  }: LastSwapComputeRequest): Promise<SwapOrder> {
    let swapOrder;
    // if the input and output asset are the same...
    if (srcToken.equals(dstToken)) {
      // no need to swap
      swapOrder = SwapOrder.sameToken(srcToken);
    } else {
      try {
        // otherwise compute swap
        swapOrder = await this.computeSwap(chainId, srcToken, dstToken, amountIn, minAmountOut);
      } catch (e) {
        // if it fails means there is no route
        // or the best route doesn't cut the bar,
        // so we just send order to deliver the incoming
        // assets to the user
        swapOrder = SwapOrder.sameToken(srcToken);
      }
    }
    return swapOrder;
  }

  /**
   * Computes the best possible swap order
   * It will start with a default slippage and will try to look for one that fits,
   * that is, of course, if the swap is at all possible
   * @param chainId
   * @param srcToken
   * @param dstToken
   * @param amountIn
   * @param acceptedMinAmountOut
   * @private
   */
  private async computeSwap(
    chainId: string,
    srcToken: Token,
    dstToken: Token,
    amountIn: BigInteger,
    acceptedMinAmountOut: BigInteger,
  ) {
    let foundOptimalSlippage = false;
    let slippage = 2;
    let swapOrder: SwapOrder;

    do {
      if (slippage < 0.1) {
        // this means we tried to optimize the slippage to the limit
        // so the `expectedMinAmountOut` fall inside the `acceptedMinAmountOut`,
        // but even with a slippage as low as 0.1% we couldn't achieve,
        // so we cannot make sure that a swap would deliver the promised result
        throw new Error('no swap possible');
      }

      // quote a swap with the current settings
      const request = new SwapRequest(chainId, srcToken, dstToken, slippage, amountIn, amountIn);
      swapOrder = await this.getBestSwap(request);

      if (swapOrder.expectedAmountOut.lessThan(acceptedMinAmountOut)) {
        // this means the amountOut offered by the best swap falls below
        // the minimum accepted amountOut, therefore we can't deliver,
        // so we can't execute this swap
        throw new Error('no swap possible');
      }

      // if it gets here means the expected amount out is above the threshold,
      // that's good

      // now we check if the minimum amountOut offered by the swap is
      // still an accepted amount
      if (swapOrder.expectedMinAmountOut.lessThan(acceptedMinAmountOut)) {
        // this means the slippage was too big, so we try again halving it
        slippage = slippage / 2;
      } else {
        // this means we found an order that falls inside the accepted requirements
        foundOptimalSlippage = true;
      }
    } while (!foundOptimalSlippage);

    // so we return it
    return swapOrder;
  }

  /**
   * Given a SwapRequest it checks all the enabled providers and returns
   * the best possible order, if any
   * @param request
   * @private
   */
  private async getBestSwap(request: SwapRequest): Promise<SwapOrder> {
    const promises = [];
    // for every enabled exchange
    for (const exchangeId of this.exchanges.getEnabled(request.chainId)) {
      // quote the possible order
      const swapOrderPromise = this.quoteOrder(exchangeId, request);
      // and aggregate promise
      promises.push(swapOrderPromise);
    }
    // resolve all promises and order the orders
    const orders = (await Promise.all(promises))
      .filter((order) => {
        // filters out cases where no swap exists
        return order !== undefined;
      })
      .sort((a: SwapOrder, b: SwapOrder) => {
        const amountA = a.expectedAmountOut;
        const amountB = b.expectedAmountOut;
        if (amountA.greaterThan(amountB)) {
          return -1;
        } else if (amountA.lessThan(amountB)) {
          return 1;
        } else {
          return 0;
        }
      });

    if (orders.length === 0) {
      throw new Error('no possible order');
    }

    return orders[0];
  }

  /**
   * Quotes a specific exchange for an order
   * @param exchangeId
   * @param request
   * @returns Possible order or nothing
   * @private
   */
  private async quoteOrder(exchangeId: string, request: SwapRequest): Promise<SwapOrder> {
    try {
      return await this.exchanges.execute(exchangeId, request);
    } catch (e) {
      // no possible path, nothing to do ..
    }
  }
}
