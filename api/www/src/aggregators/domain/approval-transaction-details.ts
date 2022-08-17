import { ContractAddress } from '../../shared/types';

export class ApprovalTransactionDetails {
  constructor(private readonly _to: ContractAddress, private readonly _callData: string) {}

  get to(): ContractAddress {
    return this._to;
  }

  get callData(): string {
    return this._callData;
  }
}
