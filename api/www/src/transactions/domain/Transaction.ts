import { ContractAddress } from '../../shared/types';
import { BigInteger } from '../../shared/domain/BigInteger';

export class Transaction {
  public static create(
    _txHash: string,
    _walletAddress: string,
    _routerAddress: ContractAddress,
    _fromChainId: string,
    _toChainId: string,
    _srcToken: ContractAddress,
    _bridgeTokenIn: ContractAddress,
    _bridgeTokenOut: ContractAddress,
    _dstToken: ContractAddress,
    _amount: string,
  ) {
    const executed = new Date();
    const completed = _fromChainId == _toChainId ? executed : null;
    return new Transaction(
      _txHash,
      _walletAddress,
      _routerAddress,
      _fromChainId,
      _toChainId,
      _srcToken,
      _bridgeTokenIn,
      _bridgeTokenOut,
      _dstToken,
      BigInteger.fromString(_amount),
      BigInteger.zero(),
      BigInteger.zero(),
      BigInteger.zero(),
      executed,
      null,
      completed,
    );
  }

  constructor(
    private readonly _txHash: string,
    private readonly _walletAddress: string,
    private readonly _routerAddress: string,
    private readonly _fromChainId: string,
    private readonly _toChainId: string,
    private readonly _srcToken: ContractAddress,
    private readonly _bridgeTokenIn: ContractAddress,
    private readonly _bridgeTokenOut: ContractAddress,
    private readonly _dstToken: ContractAddress,
    private readonly _amountIn: BigInteger,
    private _bridgeAmountIn: BigInteger,
    private _bridgeAmountOut: BigInteger,
    private _amountOut: BigInteger,
    private readonly _executed: Date,
    private _bridged: Date,
    private _completed: Date,
  ) {}

  get txHash(): string {
    return this._txHash;
  }

  get walletAddress(): string {
    return this._walletAddress;
  }

  get routerAddress(): string {
    return this._routerAddress;
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

  get bridgeTokenIn(): ContractAddress {
    return this._bridgeTokenIn;
  }

  get bridgeTokenOut(): ContractAddress {
    return this._bridgeTokenOut;
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

  get bridgeAmountIn(): string {
    return this._bridgeAmountIn ? this._bridgeAmountIn.toString() : '';
  }

  get bridgeAmountOut(): string {
    return this._bridgeAmountOut ? this._bridgeAmountOut.toString() : '';
  }

  get executed(): Date {
    return this._executed;
  }

  get bridged(): Date {
    return this._bridged;
  }

  get completed(): Date {
    return this._completed;
  }

  /** Modifiers */

  public markAsBridged(now: Date): Transaction {
    this._bridged = now;
    return this;
  }

  public markAsCompleted(now: Date): Transaction {
    this._completed = now;
    return this;
  }

  public setBridgeAmountIn(amount: BigInteger): Transaction {
    this._bridgeAmountIn = amount;
    return this;
  }

  public setBridgeAmountOut(amount: BigInteger): Transaction {
    this._bridgeAmountOut = amount;
    return this;
  }

  public setAmountOut(amount: BigInteger): Transaction {
    this._amountOut = amount;
    return this;
  }
}
