import { BridgingOrder } from '../../../../src/bridges/domain/bridging-order';
import { BridgingFees } from '../../../../src/bridges/domain/BridgingFees';
import { BridgingLimits } from '../../../../src/bridges/domain/BridgingLimits';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { Tokens } from '../../../../src/shared/enums/Tokens';
import { USDC } from '../../../../src/shared/enums/TokenSymbols';
import { Mainnet, Polygon } from '../../../../src/shared/enums/ChainIds';

export class BridgingOrderMother {
  static create(
    amount: BigInteger,
    tokenIn,
    tokenOut,
    chainId: string,
    fees: BridgingFees,
    limits: BridgingLimits,
    required: boolean,
  ) {
    return new BridgingOrder(amount, tokenIn, tokenOut, chainId, '', fees, limits, required);
  }

  static randomWithFeesAndAmount(fees: BridgingFees, amount: BigInteger) {
    const limits = new BridgingLimits(
      BigInteger.fromDecimal('0'),
      BigInteger.fromDecimal('0'),
      BigInteger.fromDecimal('0'),
      18,
    );
    return this.create(
      amount,
      Tokens[USDC][Mainnet],
      Tokens[USDC][Polygon],
      Polygon,
      fees,
      limits,
      true,
    );
  }
}
