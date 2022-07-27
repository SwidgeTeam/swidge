import { BigNumber, ethers } from 'ethers';
import { RpcNode } from '../enums/RpcNode';

export class GasPriceFetcher {
  public async fetch(chainId: string): Promise<BigNumber> {
    const provider = new ethers.providers.JsonRpcProvider(RpcNode[chainId]);
    const feeData = await provider.getFeeData();
    return feeData.gasPrice;
  }
}
