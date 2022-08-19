export default interface GetBothTxsResponse {
    trackingId: string
    approvalTx: {
        to: string;
        callData: string;
        gasLimit: string;
    },
    mainTx: {
        to: string;
        value: string;
        callData: string;
        gasLimit: string;
    }
}
