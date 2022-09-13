import { IOrderStrategy } from './order-strategy';
import { Route } from '../../../shared/domain/route/route';

export class LowestTimeStrategy implements IOrderStrategy {
  order(routes: Route[]): Route[] {
    return routes.sort((a, b) => {
      if (a.resume.estimatedTime < b.resume.estimatedTime) {
        return -1;
      } else if (a.resume.estimatedTime > b.resume.estimatedTime) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
