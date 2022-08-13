import { SwapOrder } from '../../../../src/swaps/domain/swap-order';
import { Token } from '../../../../src/shared/domain/token';
import { BigInteger } from '../../../../src/shared/domain/big-integer';
import { SwapRequest } from '../../../../src/swaps/domain/swap-request';
import { ExchangeProviders } from '../../../../src/swaps/domain/providers/exchange-providers';
import { TokenMother } from '../../shared/domain/token.mother';
import { BigIntegerMother } from '../../shared/domain/big-integer.mother';

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

  public static withExpectedAmountsOut(
    expectedAmountOut: BigInteger,
    expectedMinAmountOut?: BigInteger,
  ): SwapOrder {
    const minAmountOut = expectedMinAmountOut
      ? expectedMinAmountOut
      : expectedAmountOut.subtractPercentage(1);

    return this.create(
      ExchangeProviders.Sushi,
      TokenMother.random(),
      TokenMother.random(),
      BigIntegerMother.random(),
      expectedAmountOut,
      minAmountOut,
      minAmountOut,
      BigInteger.fromString('0'),
      true,
    );
  }
}
