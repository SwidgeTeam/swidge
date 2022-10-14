import { AggregatorRequest } from './aggregator-request';
import { Route } from '../../shared/domain/route/route';
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

export interface SteppedAggregator {
  buildTx: (request: AggregatorRequest) => Promise<AggregatorTx>;
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

export interface AggregatorTx {
  tx: TransactionDetails;
  trackingId: string;
  approvalContract: string;
}
