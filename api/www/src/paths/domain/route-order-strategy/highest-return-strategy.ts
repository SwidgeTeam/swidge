import { IOrderStrategy } from './order-strategy';
import { Route } from '../../../shared/domain/route/route';
import descendingOrder from '../../../shared/domain/descending-order';

export class HighestReturnStrategy implements IOrderStrategy {
  order(routes: Route[]): Route[] {
    return routes.sort((a, b) => {
      return descendingOrder(a.resume.amountOut, b.resume.amountOut);
    });
  }
}
