import { DomainException } from '../../shared/domain/DomainException';

export class AmountTooBig extends DomainException {
  constructor() {
    super('TOO_BIG_AMOUNT', 400);
  }
}
