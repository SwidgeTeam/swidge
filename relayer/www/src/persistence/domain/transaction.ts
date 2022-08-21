import { ContractAddress } from '../../shared/types';
import { BigNumber } from 'ethers';

export class Transaction {
  constructor(
    private _txHash: string,
    private _walletAddress: string,
    private _routerAddress: string,
    private _fromChainId: string,
    private _toChainId: string,
    private _srcToken: ContractAddress,
    private _bridgeTokenIn: ContractAddress,
    private _bridgeTokenOut: ContractAddress,
    private _dstToken: ContractAddress,
    private _amountIn: BigNumber,
    private _bridgeAmountIn: BigNumber,
    private _bridgeAmountOut: BigNumber,
    private _amountOut: BigNumber,
    private _executed: Date,
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
}
