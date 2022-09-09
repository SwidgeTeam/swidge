import { ContractAddress } from '../../shared/types';
import { BigInteger } from '../../shared/domain/big-integer';

export class Transaction {
  private COMPLETED_STATUS = 'completed';
  private ONGOING_STATUS = 'ongoing';

  public static create(
    _txHash: string,
    _walletAddress: string,
    _fromChainId: string,
    _toChainId: string,
    _srcToken: ContractAddress,
    _dstToken: ContractAddress,
    _amount: string,
  ) {
    const executed = new Date();
    const completed = _fromChainId == _toChainId ? executed : null;
    return new Transaction(
      _txHash,
      '',
      _walletAddress,
      _fromChainId,
      _toChainId,
      _srcToken,
      _dstToken,
      BigInteger.fromString(_amount),
      BigInteger.zero(),
      executed,
      completed,
    );
  }

  constructor(
    private readonly _txHash: string,
    private _destinationTxHash: string,
    private readonly _walletAddress: string,
    private readonly _fromChainId: string,
    private readonly _toChainId: string,
    private readonly _srcToken: ContractAddress,
    private readonly _dstToken: ContractAddress,
    private readonly _amountIn: BigInteger,
    private _amountOut: BigInteger,
    private readonly _executed: Date,
    private _completed: Date,
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

  get status(): string {
    return this.completed ? this.COMPLETED_STATUS : this.ONGOING_STATUS;
  }
}
