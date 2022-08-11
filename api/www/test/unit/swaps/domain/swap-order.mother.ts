import { SwapOrder } from '../../../../src/swaps/domain/SwapOrder';
import { Token } from '../../../../src/shared/domain/Token';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { SwapRequest } from '../../../../src/swaps/domain/SwapRequest';

export class SwapOrderMother {
  public static create(
    providerCode: string,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: BigInteger,
    expectedAmountOut: BigInteger,
    expectedMinAmountOut: BigInteger,
    worstCaseAmountOut: BigInteger,
    estimatedGas: BigInteger,
    required,
  ): SwapOrder {
    return new SwapOrder(
      providerCode,
      tokenIn,
      tokenOut,
      '0x',
      amountIn,
      expectedAmountOut,
      expectedMinAmountOut,
      worstCaseAmountOut,
      estimatedGas,
      required,
    );
  }

  public static fromRequest(provider: string, request: SwapRequest, amount: string): SwapOrder {
    const expectedAmountOut = BigInteger.fromDecimal(amount, request.tokenOut.decimals);
    const minAmountOut = expectedAmountOut.subtractPercentage(1);
    const worstCaseAmountOut = minAmountOut.subtractPercentage(1);

    return this.create(
      provider,
      request.tokenIn,
      request.tokenOut,
      request.amountIn,
      expectedAmountOut,
      minAmountOut,
      worstCaseAmountOut,
      BigInteger.fromString('0'),
      true,
    );
  }
}
