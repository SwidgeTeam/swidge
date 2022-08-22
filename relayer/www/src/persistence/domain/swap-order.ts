import { ContractAddress } from '../../shared/types';

export class SwapOrder {
  constructor(
    private readonly _providerCode: number,
    private readonly _tokenIn: ContractAddress,
    private readonly _tokenOut: ContractAddress,
    private readonly _data: string,
    private readonly _estimatedGas: string,
    private readonly _required: boolean,
  ) {}

  get providerCode(): number {
    return this._providerCode;
  }

  get tokenIn(): ContractAddress {
    return this._tokenIn;
  }

  get tokenOut(): ContractAddress {
    return this._tokenOut;
  }

  get data(): string {
    return this._data;
  }

  get estimatedGas(): string {
    return this._estimatedGas;
  }

  get required(): boolean {
    return this._required;
  }
}
