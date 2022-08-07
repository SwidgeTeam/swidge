import { BigInteger } from './BigInteger';
import { TransactionDetails } from './transaction-details';
import { RouteStep } from './route-step';

export class Route {
  constructor(
    private readonly _amountOut: BigInteger,
    private readonly _transactionDetails: TransactionDetails,
    private readonly _steps: RouteStep[],
  ) {}

  get amountOut(): string {
    const lastStep = this._steps[this._steps.length - 1];
    return this._amountOut.toDecimal(lastStep.tokenOut.decimals);
  }

  get transactionDetails(): TransactionDetails {
    return this._transactionDetails;
  }

  get steps(): RouteStep[] {
    return this._steps;
  }
}
