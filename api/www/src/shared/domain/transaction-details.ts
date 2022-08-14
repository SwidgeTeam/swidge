import { BigInteger } from './big-integer';
import { ContractAddress } from '../types';

export class TransactionDetails {
  constructor(
    private readonly _to: ContractAddress,
    private readonly _approvalAddress: ContractAddress,
    private readonly _callData: string,
    private readonly _value: BigInteger,
    private readonly _gasLimit: BigInteger,
    private readonly _gasPrice: BigInteger,
  ) {}

  get to(): ContractAddress {
    return this._to;
  }

  get approvalAddress(): ContractAddress {
    return this._approvalAddress;
  }

  get callData(): string {
    return this._callData;
  }

  get value(): BigInteger {
    return this._value;
  }

  get gasLimit(): BigInteger {
    return this._gasLimit;
  }

  get gasPrice(): BigInteger {
    return this._gasPrice;
  }
}
