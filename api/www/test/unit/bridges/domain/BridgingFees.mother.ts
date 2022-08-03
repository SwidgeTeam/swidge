import { BridgingFees } from '../../../../src/bridges/domain/BridgingFees';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';

export class BridgingFeesMother {
  static create(percentage, maxFee, minFee, decimals) {
    return new BridgingFees(
      percentage,
      BigInteger.fromDecimal(maxFee),
      BigInteger.fromDecimal(minFee),
      decimals,
    );
  }
}
