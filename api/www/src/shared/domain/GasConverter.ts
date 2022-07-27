import { BigNumber, ethers } from 'ethers';

export class GasConverter {
  public async convert(
    gasUnits: BigNumber,
    gasPrice: BigNumber,
    priceOriginCoin: BigNumber,
    priceDestinationCoin: BigNumber,
  ): Promise<BigNumber> {
    // Compute cost in destination Wei
    const feeInDestinationWei = gasPrice.mul(gasUnits);

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
