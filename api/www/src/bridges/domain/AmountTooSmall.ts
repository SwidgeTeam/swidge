import { DomainException } from '../../shared/domain/DomainException';

export class AmountTooSmall extends DomainException {
  constructor() {
    super('TOO_SMALL_AMOUNT', 400);
  }
}
