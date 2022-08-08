import { IOrderStrategy } from './order-strategy';
import { Route } from '../../../shared/domain/route';
import { orderBy } from 'lodash';

export class HighestReturnStrategy implements IOrderStrategy {
  order(routes: Route[]): Route[] {
    return orderBy(
      routes,
      (route: Route) => {
        return route.amountOut;
      },
      ['desc'],
    );
  }
}
