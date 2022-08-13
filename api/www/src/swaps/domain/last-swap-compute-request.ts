import { Token } from '../../shared/domain/Token';
import { BigInteger } from '../../shared/domain/BigInteger';

export class LastSwapComputeRequest {
  constructor(
    private readonly _chainId: string,
    private readonly _srcToken: Token,
    private readonly _dstToken: Token,
    private readonly _amountIn: BigInteger,
    private readonly _minAmountOut: BigInteger,
  ) {}

  get chainId(): string {
    return this._chainId;
  }

  get srcToken(): Token {
    return this._srcToken;
  }

  get dstToken(): Token {
    return this._dstToken;
  }

  get amountIn(): BigInteger {
    return this._amountIn;
  }

  get minAmountOut(): BigInteger {
    return this._minAmountOut;
  }
}
