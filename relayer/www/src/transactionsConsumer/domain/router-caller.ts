import { ContractAddress } from '../../shared/types';
import { ContractReceipt } from 'ethers';

export interface FinalizeCrossParams {
  rpcNode: ContractAddress;
  routerAddress: ContractAddress;
  receiverAddress: string;
  txHash: string;
  swap: {
    providerCode: number;
    amountIn: string;
    tokenIn: ContractAddress;
    tokenOut: ContractAddress;
    data: string;
    estimatedGas: string;
    required: boolean;
  };
}

export interface IRouterCaller {
  call(params: FinalizeCrossParams): Promise<ContractReceipt>;
}
