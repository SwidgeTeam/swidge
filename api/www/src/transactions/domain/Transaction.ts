import { ContractAddress } from '../../shared/types';
import { ExternalTransactionStatus } from '../../aggregators/domain/status-check';
import { TransactionStep } from './TransactionStep';
import { randomUUID } from 'crypto';

export class Transaction {
  public static create(
    _walletAddress: string,
    _receiver: string,
    _fromChainId: string,
    _toChainId: string,
    _srcToken: ContractAddress,
    _dstToken: ContractAddress,
    _status: ExternalTransactionStatus,
  ) {
    const id = randomUUID();
    const executed = new Date();
    const completed = _fromChainId == _toChainId ? executed : null;
    return new Transaction(
      id,
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

  private readonly steps: TransactionStep[];

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
    this.steps = [];
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

  public addStep(step: TransactionStep): void {
    this.steps.push(step);
  }

  public lastStep() {
    return this.steps[this.steps.length - 1];
  }

  /** Modifiers */

  public updateLastStep(lastStep: TransactionStep) {
    this.steps[this.steps.length - 1] = lastStep;

    if (lastStep.toChainId == this.toChainId && lastStep.dstToken == this.dstToken) {
      this._completed = new Date();
      this._status = lastStep.status;
    }
  }
}
