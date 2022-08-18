import { StatusCheckRequest, StatusCheckResponse } from './status-check';

export interface ExternalAggregator {
  executedTransaction: (txHash: string, trackingId: string) => Promise<void>;
  checkStatus: (request: StatusCheckRequest) => Promise<StatusCheckResponse>;
}
