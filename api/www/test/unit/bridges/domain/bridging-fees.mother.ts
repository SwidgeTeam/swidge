import { BridgingFees } from '../../../../src/bridges/domain/BridgingFees';
import { faker } from '@faker-js/faker';
import { BigIntegerMother } from '../../shared/domain/big-integer.mother';

export class BridgingFeesMother {
  public static create(percentage, maxFee, minFee, decimals): BridgingFees {
    return new BridgingFees(percentage, maxFee, minFee, decimals);
  }

  public static random(): BridgingFees {
    return this.create(
      faker.datatype.number({
        min: 1,
        max: 15,
      }),
      BigIntegerMother.random(),
      BigIntegerMother.random(),
      faker.datatype.number({
        min: 6,
        max: 18,
      }),
    );
  }
}
