import { DomainException } from '../../shared/domain/domain-exception';

export class AmountTooSmall extends DomainException {
  constructor() {
    super('TOO_SMALL_AMOUNT', 400);
  }
}
