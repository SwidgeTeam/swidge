import { TransactionDetails } from '../../shared/domain/transaction-details';
import { Aggregator } from './aggregator';
import { ApprovalTransactionDetails } from './approval-transaction-details';

export interface TwoSteppedAggregator extends Aggregator {
  buildApprovalTx: (routeId: string, senderAddress: string) => Promise<ApprovalTransactionDetails>;
  buildTx: (
    routeId: string,
    senderAddress: string,
    receiverAddress: string,
  ) => Promise<TransactionDetails>;
}
