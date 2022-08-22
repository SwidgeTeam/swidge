export interface SwapExecuted {
  txHash: string;
  routerAddress: string;
  wallet: string;
  chainId: string;
  srcToken: string;
  dstToken: string;
  amountIn: string;
  amountOut: string;
}

export interface CrossInitiated {
  txHash: string;
  routerAddress: string;
  wallet: string;
  receiver: string;
  fromChain: string;
  toChain: string;
  srcToken: string;
  bridgeTokenIn: string;
  bridgeTokenOut: string;
  dstToken: string;
  amountIn: string;
  amountCross: string;
  minAmountOut: string;
}

export interface CrossFinalized {
  txHash: string;
  destinationTxHash: string;
  amountOut: string;
  completed: Date;
}

export interface MultichainDelivered {
  originTxHash: string;
  amountOut: string;
  bridged: Date;
}

export const Events = {
  SwapExecuted: 'swap_executed',
  CrossInitiated: 'cross_initiated',
  CrossFinalized: 'cross_finalized',
  MultichainDelivered: 'multichain_delivered',
};
