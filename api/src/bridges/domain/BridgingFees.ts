import { BigInteger } from '../../shared/domain/BigInteger';

export class BridgingFees {
  constructor(
    private readonly _percentageFee: number,
    private readonly _maximumFee: BigInteger,
    private readonly _minimumFee: BigInteger,
  ) {
    if (_percentageFee < 0)
      throw new Error('Cross fee percentage should not be negative');
    if (_percentageFee > 100)
      throw new Error('Cross fee percentage should not be superior to 100');
    if (_maximumFee.isNegative())
      throw new Error('Minimum fee should not be negative');
    if (_minimumFee.isNegative())
      throw new Error('Maximum fee should not be negative');
  }

  get percentageFee(): number {
    return this._percentageFee;
  }

  get maximumFee(): BigInteger {
    return this._maximumFee;
  }

  get minimumFee(): BigInteger {
    return this._minimumFee;
  }
}
