import { SwapOrder } from './SwapOrder';
import { ContractAddress } from '../../shared/types';

export interface CreateTransactionPayload {
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
}

export interface UpdateTransactionPayload {
  txHash: string;
  bridgeAmountIn?: string;
  bridgeAmountOut?: string;
  amountOut?: string;
  bridged?: Date;
  completed?: Date;
}

export interface SwapRequest {
  chainId: string;
  tokenIn: ContractAddress;
  tokenOut: ContractAddress;
  amountIn: string;
}

export interface TransactionsRepository {
  create(payload: CreateTransactionPayload): Promise<void>;

  update(payload: UpdateTransactionPayload): Promise<void>;

  quoteSwap(request: SwapRequest): Promise<SwapOrder>;

  getRouterAddress(): Promise<string>;
}
