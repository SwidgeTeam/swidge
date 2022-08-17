export default interface GetApprovalTxResponseJson {
    tx: {
        to: string;
        data: string;
        value: string;
        gasLimit: string;
    }
}
