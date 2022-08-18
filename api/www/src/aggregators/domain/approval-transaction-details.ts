import { ContractAddress } from '../../shared/types';
import { BigInteger } from '../../shared/domain/big-integer';

export class ApprovalTransactionDetails {
  constructor(private readonly _to: ContractAddress, private readonly _callData: string) {}

  get to(): ContractAddress {
    return this._to;
  }

  get callData(): string {
    return this._callData;
  }

  get gasLimit(): BigInteger {
    return BigInteger.fromString('70000'); // good enough for a ERC20 approval
  }
}
