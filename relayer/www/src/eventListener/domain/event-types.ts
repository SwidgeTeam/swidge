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

export const abiEvents = [
  'event SwapExecuted(' +
    'address srcToken,' +
    'address dstToken,' +
    'uint256 chainId,' +
    'uint256 amountIn,' +
    'uint256 amountOut)',
  'event CrossInitiated(' +
    'address srcToken,' +
    'address bridgeTokenIn,' +
    'address bridgeTokenOut,' +
    'address dstToken,' +
    'address receiver,' +
    'uint256 fromChain,' +
    'uint256 toChain,' +
    'uint256 amountIn,' +
    'uint256 amountCross,' +
    'uint256 minAmountOut)',
  'event CrossFinalized(' +
    'bytes32 txHash,' +
    'uint256 amountOut,' +
    'address assetOut)',
];
