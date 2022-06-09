export class AnyswapTransaction {
  private readonly _anyswapId: string;
  private readonly _fromAddress: string;
  private readonly _toAddress: string;
  private readonly _fromChainId: string;
  private readonly _toChainId: string;
  private readonly _fromValue: string;
  private readonly _toValue: string;
  private readonly _sourceTx: string;
  private readonly _destinationTx: string;
  private readonly _status: number;

  private readonly COMPLETED_STATUS = 10;
  private readonly SWAPPING_STATUS = 9;

  constructor(
    _anyswapId: string,
    _fromAddress: string,
    _toAddress: string,
    _fromChainId: string,
    _toChainId: string,
    _fromValue: string,
    _toValue: string,
    _sourceTx: string,
    _destinationTx: string,
    _status: number,
  ) {
    this._anyswapId = _anyswapId;
    this._fromAddress = _fromAddress;
    this._toAddress = _toAddress;
    this._fromChainId = _fromChainId;
    this._toChainId = _toChainId;
    this._fromValue = _fromValue;
    this._toValue = _toValue;
    this._sourceTx = _sourceTx;
    this._destinationTx = _destinationTx;
    this._status = _status;
  }

  get anyswapId(): string {
    return this._anyswapId;
  }

  get fromAddress(): string {
    return this._fromAddress;
  }

  get toAddress(): string {
    return this._toAddress;
  }

  get fromChainId(): string {
    return this._fromChainId;
  }

  get toChainId(): string {
    return this._toChainId;
  }

  get fromValue(): string {
    return this._fromValue;
  }

  get toValue(): string {
    return this._toValue;
  }

  get sourceTx(): string {
    return this._sourceTx;
  }

  get destinationTx(): string {
    return this._destinationTx;
  }

  get isCompleted(): boolean {
    return (
      this._status === this.COMPLETED_STATUS ||
      (this._status === this.SWAPPING_STATUS &&
        this._destinationTx !== '' &&
        this._toValue !== '')
    );
  }
}
