import { ContractAddress } from '../../shared/types';

export class Contract {
  constructor(
    private readonly _chainId: string,
    private readonly _address: ContractAddress,
  ) {}

  get chainId(): string {
    return this._chainId;
  }

  get address(): ContractAddress {
    return this._address;
  }
}
