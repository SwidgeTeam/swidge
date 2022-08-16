import { TransactionDetails } from './transaction-details';
import { RouteStep } from './route-step';
import { RouteResume } from './route-resume';
import { AggregatorDetails } from './aggregator-details';

export class Route {
  constructor(
    private readonly _aggregator: AggregatorDetails,
    private readonly _resume: RouteResume,
    private readonly _steps: RouteStep[],
    private readonly _transactionDetails?: TransactionDetails,
  ) {}

  get aggregator(): AggregatorDetails {
    return this._aggregator;
  }

  get amountOut(): string {
    return this._resume.amountOut.toDecimal(this._resume.toToken.decimals);
  }

  get resume(): RouteResume {
    return this._resume;
  }

  get transactionDetails(): TransactionDetails | undefined {
    return this._transactionDetails;
  }

  get steps(): RouteStep[] {
    return this._steps;
  }
}
