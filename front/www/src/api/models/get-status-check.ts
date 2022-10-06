export interface StatusCheckRequest {
    txId: string
}

export interface StatusCheckResponse {
    txId: string;
    status: TransactionStatus;
    amountOut: string;
    dstTxHash: string;
}

export enum TransactionStatus {
    Pending = 'pending',
    Failed = 'failed',
    Success = 'success',
}
