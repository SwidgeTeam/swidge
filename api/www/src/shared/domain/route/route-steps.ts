import { Collection } from '../../Collection';
import { RouteStep } from './route-step';
import { BigInteger } from '../big-integer';

export class RouteSteps extends Collection {
  type() {
    return RouteStep;
  }

  totalExecutionTime(): number {
    return this.items<RouteStep[]>().reduce((total: number, current: RouteStep) => {
      return total + current.timeInSeconds;
    }, 0);
  }

  totalFeesInUsd(): number {
    return this.items<RouteStep[]>().reduce((fee: number, current: RouteStep) => {
      return fee + Number(current.feeInUSD);
    }, 0);
  }

  lastAmountOut(): BigInteger {
    return this.items<RouteStep[]>()[this.count() - 1].amountOut;
  }
}
