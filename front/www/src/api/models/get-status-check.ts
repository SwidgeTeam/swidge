export interface StatusCheckResponse {
    status: TransactionStatus;
}

export enum TransactionStatus {
    Pending,
    Failed,
    Success,
}
