import { SwapOrder } from './SwapOrder';
import { ContractAddress } from '../../shared/types';
import { Contract } from '../../shared/domain/Contract';
import { Transaction } from './Transaction';

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
  destinationTxHash?: string;
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

  getTx(txHash: string): Promise<Transaction | null>;

  quoteSwap(request: SwapRequest): Promise<SwapOrder>;

  getRouterAddress(): Promise<string>;

  getMultichainRouters(): Promise<Contract[]>;
}
