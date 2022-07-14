import { Token } from '../../shared/domain/Token';
import { BigInteger } from '../../shared/domain/BigInteger';

export class BridgingRequest {
  constructor(
    private readonly _fromChainId: string,
    private readonly _toChainId: string,
    private readonly _tokenIn: Token,
    private readonly _amount: BigInteger,
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

  get amount(): BigInteger {
    return this._amount;
  }
}
