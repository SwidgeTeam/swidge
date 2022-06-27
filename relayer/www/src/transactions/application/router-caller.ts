import { ethers, ContractReceipt } from 'ethers';
import { ConfigService } from '../../config/config.service';
import { ContractAddress } from '../../shared/types';
import routerAbi from './router.json';
import { Injectable } from '@nestjs/common';

export interface FinalizeCrossParams {
  rpcNode: ContractAddress;
  routerAddress: ContractAddress;
  receiverAddress: string;
  txHash: string;
  fee: string;
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

@Injectable()
export class RouterCaller {
  constructor(private readonly configService: ConfigService) {}

  async call(params: FinalizeCrossParams): Promise<ContractReceipt> {
    // Connect to the right RPC node
    const provider = new ethers.providers.JsonRpcProvider(params.rpcNode);

    // Get the relayer signer
    const signer = new ethers.Wallet(this.configService.privateKey, provider);

    // Instantiate Router's contract
    const Router = new ethers.Contract(params.routerAddress, routerAbi, signer);

    const feeData = await provider.getFeeData();

    // Create transaction
    const tx = await Router.finalizeSwidge(
      params.swap.amountIn,
      params.receiverAddress,
      params.txHash,
      [
        params.swap.providerCode,
        params.swap.tokenIn,
        params.swap.tokenOut,
        params.swap.data,
        params.swap.required,
      ],
      {
        gasPrice: feeData.gasPrice,
        gasLimit: params.swap.estimatedGas,
      },
    ).catch((error) => {
      throw new Error(error.body);
    });

    // Return broadcast promise
    return tx.wait().then((receipt) => {
      if (!receipt.status || receipt.status === 0) {
        throw new Error('Transaction failed to execute');
      }
    });
  }
}
