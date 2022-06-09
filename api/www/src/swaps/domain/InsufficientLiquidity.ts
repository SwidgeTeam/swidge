import { DomainException } from '../../shared/domain/DomainException';

export class InsufficientLiquidity extends DomainException {
  constructor() {
    super('INSUFFICIENT_LIQUIDITY', 400);
  }
}
