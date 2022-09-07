import { IOrderStrategy } from './order-strategy';
import { Route } from '../../../shared/domain/route/route';
import descendingOrder from '../../../shared/domain/descending-order';
import { BigInteger } from '../../../shared/domain/big-integer';

export class LowestTimeStrategy implements IOrderStrategy {
  order(routes: Route[]): Route[] {
    return routes.sort((a, b) => {
      return descendingOrder(
        BigInteger.fromDecimal(a.resume.estimatedTime.toString()),
        BigInteger.fromDecimal(b.resume.estimatedTime.toString()),
      );
    });
  }
}
