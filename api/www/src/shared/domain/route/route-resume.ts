import { Token } from '../token';
import { BigInteger } from '../big-integer';

export class RouteResume {
  constructor(
    private readonly _fromChain: string,
    private readonly _toChain: string,
    private readonly _fromToken: Token,
    private readonly _toToken: Token,
    private readonly _amountIn: BigInteger,
    private readonly _amountOut: BigInteger,
    private readonly _minAmountOut: BigInteger,
    private readonly _estimatedTime: number,
  ) {}

  get fromChain(): string {
    return this._fromChain;
  }

  get toChain(): string {
    return this._toChain;
  }

  get fromToken(): Token {
    return this._fromToken;
  }

  get toToken(): Token {
    return this._toToken;
  }

  get amountIn(): BigInteger {
    return this._amountIn;
  }

  get amountOut(): BigInteger {
    return this._amountOut;
  }

  get minAmountOut(): BigInteger {
    return this._minAmountOut;
  }

  get estimatedTime(): number {
    return this._estimatedTime;
  }
}
