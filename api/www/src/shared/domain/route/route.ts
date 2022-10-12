import { TransactionDetails } from './transaction-details';
import { RouteResume } from './route-resume';
import { AggregatorDetails } from '../aggregator-details';
import { ApprovalTransactionDetails } from './approval-transaction-details';
import { RouteFees } from './route-fees';
import { randomUUID } from 'crypto';

export class Route {
  private readonly _id: string;
  private readonly _tags: string[];

  constructor(
    private readonly _aggregator: AggregatorDetails,
    private readonly _resume: RouteResume,
    private readonly _fees: RouteFees,
    private readonly _approvalTransaction?: ApprovalTransactionDetails,
    private readonly _transactionDetails?: TransactionDetails,
  ) {
    this._id = randomUUID();
    this._tags = [];
  }

  get id(): string {
    return this._id;
  }

  get aggregator(): AggregatorDetails {
    return this._aggregator;
  }

  get amountOut(): string {
    return this._resume.amountOut.toDecimal(this._resume.toToken.decimals);
  }

  get resume(): RouteResume {
    return this._resume;
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

  get tags(): string[] {
    return this._tags;
  }

  public addTag(value: string) {
    this._tags.push(value);
  }
}
