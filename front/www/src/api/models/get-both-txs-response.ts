export default interface GetBothTxsResponse {
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
