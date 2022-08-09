import { TransactionDetails } from './transaction-details';
import { RouteStep } from './route-step';
import { RouteResume } from './route-resume';

export class Route {
  constructor(
    private readonly _resume: RouteResume,
    private readonly _transactionDetails: TransactionDetails,
    private readonly _steps: RouteStep[],
  ) {}

  get amountOut(): string {
    return this._resume.amountOut.toDecimal(this._resume.toToken.decimals);
  }

  get resume(): RouteResume {
    return this._resume;
  }

  get transactionDetails(): TransactionDetails {
    return this._transactionDetails;
  }

  get steps(): RouteStep[] {
    return this._steps;
  }
}
