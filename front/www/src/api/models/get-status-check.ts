export interface StatusCheckRequest {
    aggregatorId: string
    fromChainId: string
    toChainId: string
    txHash: string
    trackingId: string
}

export interface StatusCheckResponse {
    status: TransactionStatus;
}

export enum TransactionStatus {
    Pending,
    Failed,
    Success,
}
