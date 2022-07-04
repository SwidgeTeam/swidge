import { BigNumber, ethers } from 'ethers';
import { PriceFeedFetcher } from './PriceFeedFetcher';
import { RpcNode } from '../enums/RpcNode';

export class PriceFeedConverter {
  private priceFeedFetcher: PriceFeedFetcher;

  constructor() {
    this.priceFeedFetcher = new PriceFeedFetcher();
  }

  public async fetch(
    fromChainId: string,
    toChainId: string,
    gasUnits: BigNumber,
  ): Promise<BigNumber> {
    const provider = new ethers.providers.JsonRpcProvider(RpcNode[toChainId]);

    // Compute cost in destination Wei
    const feeData = await provider.getFeeData();
    const feeInDestinationWei = feeData.gasPrice.mul(gasUnits);

    // Get price of both native coins
    const priceOriginCoin = await this.priceFeedFetcher.fetch(fromChainId);
    const priceDestinationCoin = await this.priceFeedFetcher.fetch(toChainId);

    const unit = ethers.utils.parseEther('1');

    // Compute exchange ratio
    const exchangeRatio = priceOriginCoin.mul(unit).div(priceDestinationCoin);

    // Compute cost in origin Wei
    return feeInDestinationWei.mul(exchangeRatio).div(unit);
  }
}
