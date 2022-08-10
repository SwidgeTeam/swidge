import { Route } from '../../../shared/domain/route';
import { HighestReturnStrategy } from './highest-return-strategy';

export interface IOrderStrategy {
  order(routes: Route[]): Route[];
}

export class OrderStrategy {
  public static HIGHEST_RETURN = 'HIGHEST_RETURN';

  public static get(code: string) {
    switch (code) {
      case OrderStrategy.HIGHEST_RETURN:
        return new HighestReturnStrategy();
      default:
        throw new Error('strategy not supported');
    }
  }
}
