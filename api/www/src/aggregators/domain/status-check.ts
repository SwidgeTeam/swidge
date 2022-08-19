export interface StatusCheckRequest {
  fromChain: string;
  toChain: string;
  txHash: string;
  trackingId: string;
}

export interface StatusCheckResponse {
  status: ExternalTransactionStatus;
}

export enum ExternalTransactionStatus {
  Pending,
  Failed,
  Success,
}
