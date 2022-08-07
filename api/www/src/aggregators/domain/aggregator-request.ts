import { BigInteger } from '../../shared/domain/BigInteger';
import { Token } from '../../shared/domain/Token';

export class AggregatorRequest {
  constructor(
    private readonly _fromChain: string,
    private readonly _toChain: string,
    private readonly _fromToken: Token,
    private readonly _toToken: Token,
    private readonly _amountIn: BigInteger,
  ) {}

  get fromChain() {
    return this._fromChain;
  }

  get toChain() {
    return this._toChain;
  }

  get fromToken() {
    return this._fromToken;
  }

  get toToken() {
    return this._toToken;
  }

  get amountIn() {
    return this._amountIn;
  }
}
