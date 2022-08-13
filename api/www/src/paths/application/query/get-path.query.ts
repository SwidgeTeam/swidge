import { ContractAddress } from '../../../shared/types';

export class GetPathQuery {
  constructor(
    private readonly _fromChainId: string,
    private readonly _toChainId: string,
    private readonly _srcToken: ContractAddress,
    private readonly _dstToken: ContractAddress,
    private readonly _amountIn: string,
    private readonly _slippage: number,
    private readonly _receiverAddress: string,
  ) {}

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
    return this._amountIn;
  }

  get slippage(): number {
    return this._slippage;
  }

  get receiverAddress(): string {
    return this._receiverAddress;
  }
}
