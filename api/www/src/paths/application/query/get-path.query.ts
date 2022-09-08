import { Token } from '../../../shared/domain/token';

export class GetPathQuery {
  constructor(
    private readonly _fromChainId: string,
    private readonly _toChainId: string,
    private readonly _srcToken: Token,
    private readonly _dstToken: Token,
    private readonly _amountIn: string,
    private readonly _slippage: number,
    private readonly _senderAddress: string,
    private readonly _receiverAddress: string,
  ) {}

  get fromChainId(): string {
    return this._fromChainId;
  }

  get toChainId(): string {
    return this._toChainId;
  }

  get srcToken(): Token {
    return this._srcToken;
  }

  get dstToken(): Token {
    return this._dstToken;
  }

  get amountIn(): string {
    return this._amountIn;
  }

  get slippage(): number {
    return this._slippage;
  }

  get senderAddress(): string {
    return this._senderAddress;
  }

  get receiverAddress(): string {
    return this._receiverAddress;
  }
}
