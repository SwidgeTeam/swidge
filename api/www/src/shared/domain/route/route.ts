import { TransactionDetails } from './transaction-details';
import { RouteStep } from './route-step';
import { RouteResume } from './route-resume';
import { AggregatorDetails } from '../aggregator-details';
import { ApprovalTransactionDetails } from './approval-transaction-details';
import { RouteFees } from './route-fees';

export class Route {
  constructor(
    private readonly _aggregator: AggregatorDetails,
    private readonly _resume: RouteResume,
    private readonly _steps: RouteStep[],
    private readonly _fees: RouteFees,
    private readonly _approvalTransaction?: ApprovalTransactionDetails,
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

  get steps(): RouteStep[] {
    return this._steps;
  }

  get fees(): RouteFees {
    return this._fees;
  }

  get approvalTransaction(): ApprovalTransactionDetails {
    return this._approvalTransaction;
  }

  get transaction(): TransactionDetails | undefined {
    return this._transactionDetails;
  }
}
