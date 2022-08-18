import { AggregatorRequest } from './aggregator-request';
import { Route } from '../../shared/domain/route';
import BothTxs from './both-txs';
import { ApprovalTransactionDetails } from './approval-transaction-details';
import { TransactionDetails } from '../../shared/domain/transaction-details';
import { StatusCheckRequest, StatusCheckResponse } from './status-check';

export interface Aggregator {
  isEnabledOn: (fromChainId: string, toChainId: string) => boolean;

  execute: (request: AggregatorRequest) => Promise<Route>;
}

export interface OneSteppedAggregator {
  buildTxs: (request: AggregatorRequest) => Promise<BothTxs>;
}

export interface TwoSteppedAggregator {
  buildApprovalTx: (routeId: string, senderAddress: string) => Promise<ApprovalTransactionDetails>;
  buildTx: (
    routeId: string,
    senderAddress: string,
    receiverAddress: string,
  ) => Promise<TransactionDetails>;
}

export interface ExternalAggregator {
  executedTransaction: (
    txHash: string,
    trackingId: string,
    fromAddress: string,
    toAddress: string,
  ) => Promise<void>;
  checkStatus: (request: StatusCheckRequest) => Promise<StatusCheckResponse>;
}
