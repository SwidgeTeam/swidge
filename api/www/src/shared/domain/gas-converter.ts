import { BigInteger } from './big-integer';

export class GasConverter {
  public convert(
    gasUnits: BigInteger,
    gasPrice: BigInteger,
    priceOriginCoin: BigInteger,
    priceDestinationCoin: BigInteger,
  ): BigInteger {
    // Compute cost in destination Wei
    const feeInDestinationWei = gasPrice.times(gasUnits);

    const unit = BigInteger.weiInEther();

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
