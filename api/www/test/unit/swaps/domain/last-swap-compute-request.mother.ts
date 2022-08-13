import { LastSwapComputeRequest } from '../../../../src/swaps/domain/last-swap-compute-request';
import { Polygon } from '../../../../src/shared/enums/ChainIds';
import { BigInteger } from '../../../../src/shared/domain/big-integer';
import { Token } from '../../../../src/shared/domain/token';
import { TokenMother } from '../../shared/domain/token.mother';
import { BigIntegerMother } from '../../shared/domain/big-integer.mother';

export class LastSwapComputeRequestMother {
  public static create(
    chainId: string,
    srcToken: Token,
    dstToken: Token,
    amountIn: BigInteger,
    minAmountOut: BigInteger,
  ): LastSwapComputeRequest {
    return new LastSwapComputeRequest(chainId, srcToken, dstToken, amountIn, minAmountOut);
  }

  public static random(): LastSwapComputeRequest {
    return this.create(
      Polygon,
      TokenMother.random(),
      TokenMother.random(),
      BigIntegerMother.random(),
      BigIntegerMother.random(),
    );
  }

  public static withMinAmountOut(amount: BigInteger): LastSwapComputeRequest {
    return this.create(
      Polygon,
      TokenMother.random(),
      TokenMother.random(),
      BigIntegerMother.random(),
      amount,
    );
  }
}
