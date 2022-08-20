import { BigInteger } from '../big-integer';

export class RouteFees {
  constructor(
    private readonly _nativeWei: BigInteger,
    private readonly _feeInUsd: string,
  ) {}

  get nativeWei(): BigInteger {
    return this._nativeWei;
  }

  get feeInUsd(): string {
    return this._feeInUsd;
  }
}
