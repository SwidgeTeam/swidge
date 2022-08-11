export interface TransactionJob {
  txHash: string;
  router: string;
  srcToken: string;
  dstToken: string;
  toChainId: string;
  bridgeAmountOut: string;
  walletAddress: string;
  minAmountOut: string;
}
