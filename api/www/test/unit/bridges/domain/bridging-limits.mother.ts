import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { faker } from '@faker-js/faker';
import { BigIntegerMother } from '../../shared/domain/big-integer.mother';
import { BridgingLimits } from '../../../../src/bridges/domain/BridgingLimits';

export class BridgingLimitsMother {
  public static create(
    minAmount: BigInteger,
    maxAmount: BigInteger,
    threshold: BigInteger,
    decimals: number,
  ): BridgingLimits {
    return new BridgingLimits(minAmount, maxAmount, threshold, decimals);
  }

  public static random(): BridgingLimits {
    return this.create(
      BigIntegerMother.random(),
      BigIntegerMother.random(),
      BigIntegerMother.random(),
      faker.datatype.number({
        min: 6,
        max: 18,
      }),
    );
  }
}
