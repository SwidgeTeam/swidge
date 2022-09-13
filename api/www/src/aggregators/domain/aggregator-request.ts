import { BigInteger } from '../../shared/domain/big-integer';
import { Token } from '../../shared/domain/token';

export class AggregatorRequest {
  constructor(
    private readonly _fromToken: Token,
    private readonly _toToken: Token,
    private readonly _amountIn: BigInteger,
    private readonly _slippage: number,
    private readonly _senderAddress: string,
    private readonly _receiverAddress: string,
  ) {}

  get fromChain() {
    return this._fromToken.chainId;
  }

  get toChain() {
    return this._toToken.chainId;
  }

  get fromToken(): Token {
    return this._fromToken;
  }

  get toToken(): Token {
    return this._toToken;
  }

  get amountIn() {
    return this._amountIn;
  }

  get slippage() {
    return this._slippage;
  }

  get senderAddress(): string {
    return this._senderAddress;
  }

  get receiverAddress(): string {
    return this._receiverAddress;
  }
}
