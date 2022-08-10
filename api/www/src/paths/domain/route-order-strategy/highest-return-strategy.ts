import { IOrderStrategy } from './order-strategy';
import { Route } from '../../../shared/domain/route';

export class HighestReturnStrategy implements IOrderStrategy {
  order(routes: Route[]): Route[] {
    return routes.sort((a, b) => {
      const amountA = a.resume.amountOut;
      const amountB = b.resume.amountOut;
      if (amountA.greaterOrEqualThan(amountB)) {
        return -1;
      } else if (amountA.lessThan(amountB)) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
