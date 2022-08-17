export default interface GetApprovalTxResponseJson {
    tx: {
        to: string;
        callData: string;
        gasLimit: string;
    }
}
