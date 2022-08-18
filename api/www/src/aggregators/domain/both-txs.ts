import { ApprovalTransactionDetails } from './approval-transaction-details';
import { TransactionDetails } from '../../shared/domain/transaction-details';

export default class BothTxs {
  constructor(
    private readonly _trackingId: string,
    private readonly _approvalTx: ApprovalTransactionDetails | null,
    private readonly _mainTx: TransactionDetails,
  ) {}

  get trackingId(): string {
    return this._trackingId;
  }

  get approvalTx(): ApprovalTransactionDetails | null {
    return this._approvalTx;
  }

  get mainTx(): TransactionDetails {
    return this._mainTx;
  }
}
