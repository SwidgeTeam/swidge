import { TransactionDetails } from '../../shared/domain/transaction-details';
import { ApprovalTransactionDetails } from './approval-transaction-details';

export interface TwoSteppedAggregator {
  buildApprovalTx: (routeId: string, senderAddress: string) => Promise<ApprovalTransactionDetails>;
  buildTx: (
    routeId: string,
    senderAddress: string,
    receiverAddress: string,
  ) => Promise<TransactionDetails>;
}
