import { BigInteger } from '../../shared/domain/BigInteger';

export class BridgingLimits {
  constructor(
    private readonly _minimumAmount: BigInteger,
    private readonly _maximumAmount: BigInteger,
    private readonly _bigAmountThreshold: BigInteger,
  ) {}

  get minimumAmount(): BigInteger {
    return this._minimumAmount;
  }

  get maximumAmount(): BigInteger {
    return this._maximumAmount;
  }

  get bigAmountThreshold(): BigInteger {
    return this._bigAmountThreshold;
  }
}
