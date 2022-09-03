import { AggregatorRequest } from './aggregator-request';
import { Route } from '../../shared/domain/route/route';
import BothTxs from './both-txs';
import { ApprovalTransactionDetails } from '../../shared/domain/route/approval-transaction-details';
import { TransactionDetails } from '../../shared/domain/route/transaction-details';
import { StatusCheckRequest, StatusCheckResponse } from './status-check';
import { AggregatorMetadata } from '../../shared/domain/metadata';

export interface Aggregator {
  isEnabledOn: (fromChainId: string, toChainId: string) => boolean;
  execute: (request: AggregatorRequest) => Promise<Route>;
}

export interface MetadataProviderAggregator {
  /**
   * Fetches and returns the accepted metadata of this aggregator
   */
  getMetadata: () => Promise<AggregatorMetadata>;
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
