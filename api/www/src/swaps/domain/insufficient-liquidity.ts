import { DomainException } from '../../shared/domain/domain-exception';

export class InsufficientLiquidity extends DomainException {
  constructor() {
    super('INSUFFICIENT_LIQUIDITY', 400);
  }
}
