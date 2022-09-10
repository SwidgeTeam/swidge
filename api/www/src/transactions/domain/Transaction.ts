import { ContractAddress } from '../../shared/types';
import { BigInteger } from '../../shared/domain/big-integer';
import { ExternalTransactionStatus } from '../../aggregators/domain/status-check';

export class Transaction {
  public static create(
    _txHash: string,
    _walletAddress: string,
    _receiver: string,
    _fromChainId: string,
    _toChainId: string,
    _srcToken: ContractAddress,
    _dstToken: ContractAddress,
    _amountIn: BigInteger,
    _amountOut: BigInteger,
    _status: ExternalTransactionStatus,
    _aggregatorId: string,
    _trackingId: string,
  ) {
    const executed = new Date();
    const completed = _fromChainId == _toChainId ? executed : null;
    return new Transaction(
      _txHash,
      '',
      _walletAddress,
      _receiver,
      _fromChainId,
      _toChainId,
      _srcToken,
      _dstToken,
      _amountIn,
      _amountOut,
      executed,
      completed,
      _status,
      _aggregatorId,
      _trackingId,
    );
  }

  constructor(
    private readonly _txHash: string,
    private _destinationTxHash: string,
    private readonly _walletAddress: string,
    private readonly _receiver: string,
    private readonly _fromChainId: string,
    private readonly _toChainId: string,
    private readonly _srcToken: ContractAddress,
    private _dstToken: ContractAddress,
    private readonly _amountIn: BigInteger,
    private _amountOut: BigInteger,
    private readonly _executed: Date,
    private _completed: Date,
    private _status: ExternalTransactionStatus,
    private readonly _aggregatorId: string,
    private readonly _trackingId: string,
  ) {}

  get txHash(): string {
    return this._txHash;
  }

  get destinationTxHash(): string {
    return this._destinationTxHash;
  }

  get walletAddress(): string {
    return this._walletAddress;
  }

  get receiver(): string {
    return this._receiver;
  }

  get fromChainId(): string {
    return this._fromChainId;
  }

  get toChainId(): string {
    return this._toChainId;
  }

  get srcToken(): ContractAddress {
    return this._srcToken;
  }

  get dstToken(): ContractAddress {
    return this._dstToken;
  }

  get amountIn(): string {
    return this._amountIn ? this._amountIn.toString() : '';
  }

  get amountOut(): string {
    return this._amountOut ? this._amountOut.toString() : '';
  }

  get executed(): Date {
    return this._executed;
  }

  get completed(): Date {
    return this._completed;
  }

  get status(): ExternalTransactionStatus {
    return this._status;
  }

  get aggregatorId(): string {
    return this._aggregatorId;
  }

  get trackingId(): string {
    return this._trackingId;
  }

  /** Modifiers */

  public markAsCompleted(now: Date): Transaction {
    this._completed = now;
    return this;
  }

  public setAmountOut(amount: BigInteger): Transaction {
    this._amountOut = amount;
    return this;
  }

  public setDestinationToken(address: string): Transaction {
    this._dstToken = address;
    return this;
  }

  public setDestinationTxHash(destinationTxHash: string): Transaction {
    this._destinationTxHash = destinationTxHash;
    return this;
  }

  public setStatus(status: ExternalTransactionStatus): Transaction {
    this._status = status;
    return this;
  }
}
