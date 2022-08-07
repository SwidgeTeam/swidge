export class AggregatorRequest {
  constructor(
    private readonly _fromChain,
    private readonly _toChain,
    private readonly _fromToken,
    private readonly _toToken,
    private readonly _amountIn,
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
