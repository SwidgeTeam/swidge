export interface TransactionJson {
  txHash: string;
  walletAddress: string;
  routerAddress: string;
  fromChainId: string;
  toChainId: string;
  srcToken: string;
  bridgeTokenIn: string;
  bridgeTokenOut: string;
  dstToken: string;
  amountIn: string;
  bridgeAmountIn: string;
  bridgeAmountOut: string;
  amountOut: string;
  executed: string;
  bridged: string;
  completed: string;
}
