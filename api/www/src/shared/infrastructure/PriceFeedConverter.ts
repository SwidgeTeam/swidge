import { BigNumber, ethers } from 'ethers';
import { RpcNode } from '../enums/RpcNode';

export class PriceFeedConverter {
  public async fetch(
    toChainId: string,
    priceOriginCoin: BigNumber,
    priceDestinationCoin: BigNumber,
    gasUnits: BigNumber,
  ): Promise<BigNumber> {
    const provider = new ethers.providers.JsonRpcProvider(RpcNode[toChainId]);

    // Compute cost in destination Wei
    const feeData = await provider.getFeeData();
    const feeInDestinationWei = feeData.gasPrice.mul(gasUnits);

    const unit = ethers.utils.parseEther('1');

    // Compute exchange ratio
    let exchangeRatio;
    if (priceDestinationCoin.gt(priceOriginCoin)) {
      exchangeRatio = priceOriginCoin.mul(unit).div(priceDestinationCoin);
    } else {
      exchangeRatio = priceDestinationCoin.mul(unit).div(priceOriginCoin);
    }

    // Compute cost in origin Wei
    return feeInDestinationWei.mul(exchangeRatio).div(unit);
  }
}
