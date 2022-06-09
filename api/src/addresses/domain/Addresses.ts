import { Contract } from './Contract';
import { ContractAddress } from '../../shared/types';

export class Addresses {
  constructor(public readonly contracts: Contract[]) {}

  public fromChain(chainId: string): ContractAddress {
    const contract = this.contracts.find((contract) => {
      return contract.chainId === chainId;
    });

    return contract ? contract.address : '';
  }
}
