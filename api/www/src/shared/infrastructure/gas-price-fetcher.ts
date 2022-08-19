import { ethers } from 'ethers';
import { RpcNode } from '../enums/RpcNode';
import { BigInteger } from '../domain/big-integer';
import { IGasPriceFetcher } from '../domain/gas-price-fetcher';

export class GasPriceFetcher implements IGasPriceFetcher {
  public static create() {
    return new GasPriceFetcher();
  }

  public async fetch(chainId: string): Promise<BigInteger> {
    const provider = new ethers.providers.JsonRpcProvider(RpcNode[chainId]);
    const feeData = await provider.getFeeData();
    return BigInteger.fromBigNumber(feeData.gasPrice);
  }
}
