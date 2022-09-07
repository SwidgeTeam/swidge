import { Route } from '../../../shared/domain/route/route';
import { HighestReturnStrategy } from './highest-return-strategy';
import { LowestTimeStrategy } from './lowest-time-strategy';

export interface IOrderStrategy {
  order(routes: Route[]): Route[];
}

export class OrderStrategy {
  public static HIGHEST_RETURN = 'HIGHEST_RETURN';
  public static LOWEST_TIME = 'LOWEST_TIME';

  public static get(code: string) {
    switch (code) {
      case OrderStrategy.HIGHEST_RETURN:
        return new HighestReturnStrategy();
      case OrderStrategy.LOWEST_TIME:
        return new LowestTimeStrategy();
      default:
        throw new Error('strategy not supported');
    }
  }
}
