import { ethers } from 'ethers';
import { RpcNode } from '../enums/RpcNode';
import { BigInteger } from '../domain/BigInteger';

export class GasPriceFetcher {
  public async fetch(chainId: string): Promise<BigInteger> {
    const provider = new ethers.providers.JsonRpcProvider(RpcNode[chainId]);
    const feeData = await provider.getFeeData();
    return BigInteger.fromBigNumber(feeData.gasPrice);
  }
}
