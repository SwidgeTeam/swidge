import { BigInteger } from './big-integer';

export default (first: BigInteger, second: BigInteger) => {
  if (first.greaterThan(second)) {
    return -1;
  } else if (first.lessThan(second)) {
    return 1;
  } else {
    return 0;
  }
}