import { Contract } from './Contract';
import { ContractAddress } from '../../shared/types';

export class Addresses {
  constructor(private readonly _contracts: Contract[]) {}

  public fromChain(chainId: string): ContractAddress {
    const contract = this._contracts.find((contract) => {
      return contract.chainId === chainId;
    });

    return contract ? contract.address : '';
  }
}
