import { ContractAddress } from '../../shared/types';
import { BigInteger } from '../../shared/domain/big-integer';
import { ExternalTransactionStatus } from '../../aggregators/domain/status-check';

export class TransactionStep {
  constructor(
    private _originTxHash: string,
    private _destinationTxHash: string,
    private _fromChainId: string,
    private _toChainId: string,
    private _srcToken: ContractAddress,
    private _dstToken: ContractAddress,
    private _amountIn: BigInteger,
    private _amountOut: BigInteger,
    private _executed: Date,
    private _completed: Date,
    private _status: ExternalTransactionStatus,
    private _aggregatorId: string,
    private _trackingId: string,
  ) {}

  get originTxHash(): string {
    return this._originTxHash;
  }

  get destinationTxHash(): string {
    return this._destinationTxHash;
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

  public markAsCompleted(now: Date): TransactionStep {
    this._completed = now;
    return this;
  }

  public setAmountOut(amount: BigInteger): TransactionStep {
    this._amountOut = amount;
    return this;
  }

  public setDestinationToken(address: string): TransactionStep {
    this._dstToken = address;
    return this;
  }

  public setDestinationTxHash(destinationTxHash: string): TransactionStep {
    this._destinationTxHash = destinationTxHash;
    return this;
  }

  public setStatus(status: ExternalTransactionStatus): TransactionStep {
    this._status = status;
    return this;
  }
}
