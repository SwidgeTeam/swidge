export interface StatusCheckRequest {
    txHash: string
}

export interface StatusCheckResponse {
    status: TransactionStatus;
}

export enum TransactionStatus {
    Pending = 'pending',
    Failed = 'failed',
    Success = 'success',
}
