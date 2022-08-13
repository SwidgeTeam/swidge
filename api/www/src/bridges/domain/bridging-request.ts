import { Token } from '../../shared/domain/token';
import { BigInteger } from '../../shared/domain/big-integer';

export class BridgingRequest {
  constructor(
    private readonly _fromChainId: string,
    private readonly _toChainId: string,
    private readonly _tokenIn: Token,
    private readonly _amountIn: BigInteger,
    private readonly _minAmountIn: BigInteger,
  ) {}

  get fromChainId(): string {
    return this._fromChainId;
  }

  get toChainId(): string {
    return this._toChainId;
  }

  get tokenIn(): Token {
    return this._tokenIn;
  }

  get expectedAmountIn(): BigInteger {
    return this._amountIn;
  }

  get minAmountIn(): BigInteger {
    return this._minAmountIn;
  }
}
