import { DomainException } from '../../shared/domain/domain-exception';

export class AmountTooBig extends DomainException {
  constructor() {
    super('TOO_BIG_AMOUNT', 400);
  }
}
