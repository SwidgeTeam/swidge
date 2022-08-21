import { ethers, ContractReceipt } from 'ethers';
import { ConfigService } from '../../config/config.service';
import routerAbi from './router.json';
import { Injectable } from '@nestjs/common';
import { FinalizeCrossParams, IRouterCaller } from '../domain/router-caller';
import { Logger } from '../../shared/domain/logger';

@Injectable()
export class RouterCaller implements IRouterCaller {
  constructor(private readonly configService: ConfigService, private readonly logger: Logger) {}

  async call(params: FinalizeCrossParams): Promise<ContractReceipt> {
    this.logger.log('Calling contract w/ ', params);

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
        // Increase everything 20% just to give some room
        gasPrice: feeData.gasPrice,
        gasLimit: 5000000,
        //gasLimit: BigNumber.from(params.swap.estimatedGas).mul(1.2),
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
