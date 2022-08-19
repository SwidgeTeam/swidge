export default interface GetMainTxResponse {
    tx: {
        to: string;
        value: string;
        callData: string;
        gasLimit: string;
    }
}
