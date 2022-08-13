import { BigInteger } from '../../../../src/shared/domain/big-integer';
import { faker } from '@faker-js/faker';

export class BigIntegerMother {
  public static random() {
    return BigInteger.fromDecimal(
      faker.datatype
        .number({
          min: 1,
          max: 2000,
        })
        .toString(),
    );
  }
}
