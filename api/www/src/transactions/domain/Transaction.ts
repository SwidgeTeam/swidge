import { ContractAddress } from '../../shared/types';
import { ExternalTransactionStatus } from '../../aggregators/domain/status-check';
import { TransactionStep } from './TransactionStep';

export class Transaction {
  public static create(
    _id: string,
    _walletAddress: string,
    _receiver: string,
    _fromChainId: string,
    _toChainId: string,
    _srcToken: ContractAddress,
    _dstToken: ContractAddress,
    _status: ExternalTransactionStatus,
  ) {
    const executed = new Date();
    const completed = _fromChainId == _toChainId ? executed : null;
    return new Transaction(
      _id,
      _walletAddress,
      _receiver,
      _fromChainId,
      _toChainId,
      _srcToken,
      _dstToken,
      executed,
      completed,
      _status,
    );
  }

  private readonly _steps: TransactionStep[];

  constructor(
    private _id: string,
    private _walletAddress: string,
    private _receiver: string,
    private _fromChainId: string,
    private _toChainId: string,
    private _srcToken: ContractAddress,
    private _dstToken: ContractAddress,
    private _executed: Date,
    private _completed: Date,
    private _status: ExternalTransactionStatus,
  ) {
    this._steps = [];
  }

  get id(): string {
    return this._id;
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

  get executed(): Date {
    return this._executed;
  }

  get completed(): Date {
    return this._completed;
  }

  get status(): ExternalTransactionStatus {
    return this._status;
  }

  get steps(): TransactionStep[] {
    return this._steps;
  }

  get originTxHash(): string {
    return this._steps[0].originTxHash;
  }

  get destinationTxHash(): string {
    if (this.status === ExternalTransactionStatus.Pending) {
      return '';
    }
    return this.lastStep().destinationTxHash;
  }

  get amountIn(): string {
    return this._steps[0].amountIn;
  }

  get amountOut(): string {
    if (this.status === ExternalTransactionStatus.Pending) {
      return '';
    }
    return this.lastStep().amountOut;
  }

  public addStep(step: TransactionStep): void {
    this._steps.push(step);
  }

  public lastStep() {
    return this._steps[this._steps.length - 1];
  }

  /** Modifiers */

  public updateLastStep(lastStep: TransactionStep) {
    this._steps[this._steps.length - 1] = lastStep;

    if (
      (lastStep.toChainId == this.toChainId && lastStep.dstToken == this.dstToken) ||
      lastStep.status == ExternalTransactionStatus.Failed
    ) {
      this._completed = new Date();
      this._status = lastStep.status;
    }
  }
}
