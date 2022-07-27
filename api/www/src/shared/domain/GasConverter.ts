import { ethers } from 'ethers';
import { BigInteger } from './BigInteger';

export class GasConverter {
  public async convert(
    gasUnits: BigInteger,
    gasPrice: BigInteger,
    priceOriginCoin: BigInteger,
    priceDestinationCoin: BigInteger,
  ): Promise<BigInteger> {
    // Compute cost in destination Wei
    const feeInDestinationWei = gasPrice.times(gasUnits);

    const unit = BigInteger.fromBigNumber(ethers.constants.WeiPerEther);

    // Compute exchange ratio
    let exchangeRatio;
    if (priceDestinationCoin.greaterThan(priceOriginCoin)) {
      exchangeRatio = priceOriginCoin.times(unit).div(priceDestinationCoin);
    } else {
      exchangeRatio = priceDestinationCoin.times(unit).div(priceOriginCoin);
    }

    // Compute cost in origin Wei
    return feeInDestinationWei.times(exchangeRatio).div(unit);
  }
}
