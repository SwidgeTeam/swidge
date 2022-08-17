export default interface GetTxResponse {
    tx: {
        to: string;
        value: string;
        callData: string;
        gasLimit: string;
    }
}
