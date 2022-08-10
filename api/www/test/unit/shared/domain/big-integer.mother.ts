import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { faker } from '@faker-js/faker';

export class BigIntegerMother {
  public static random() {
    return BigInteger.fromDecimal(faker.random.numeric(4).toString());
  }
}
