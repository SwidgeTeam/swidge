import { BridgingOrder } from '../../../../src/bridges/domain/bridging-order';
import { BridgingFees } from '../../../../src/bridges/domain/BridgingFees';
import { BridgingLimits } from '../../../../src/bridges/domain/BridgingLimits';
import { BigInteger } from '../../../../src/shared/domain/big-integer';
import { Tokens } from '../../../../src/shared/enums/Tokens';
import { Token } from '../../../../src/shared/domain/token';
import { USDC } from '../../../../src/shared/enums/TokenSymbols';
import { Mainnet, Polygon } from '../../../../src/shared/enums/ChainIds';
import { BridgingRequest } from '../../../../src/bridges/domain/bridging-request';
import { BridgingFeesMother } from './bridging-fees.mother';
import { BridgingLimitsMother } from './bridging-limits.mother';

export class BridgingOrderMother {
  public static create(
    expectedAmountIn: BigInteger,
    minAmountIn: BigInteger,
    tokenIn,
    tokenOut,
    chainId: string,
    fees: BridgingFees,
    limits: BridgingLimits,
    required: boolean,
  ) {
    return new BridgingOrder(
      expectedAmountIn,
      minAmountIn,
      tokenIn,
      tokenOut,
      chainId,
      '0x',
      fees,
      limits,
      0,
      required,
    );
  }

  public static randomWithFeesAndAmount(fees: BridgingFees, amount: BigInteger) {
    const limits = new BridgingLimits(
      BigInteger.fromDecimal('0'),
      BigInteger.fromDecimal('0'),
      BigInteger.fromDecimal('0'),
      18,
    );
    return this.create(
      amount,
      amount,
      Tokens[USDC][Mainnet],
      Tokens[USDC][Polygon],
      Polygon,
      fees,
      limits,
      true,
    );
  }

  public static fromRequest(request: BridgingRequest, tokenOut: Token): BridgingOrder {
    return this.create(
      request.expectedAmountIn,
      request.minAmountIn,
      request.tokenIn,
      tokenOut,
      request.toChainId,
      BridgingFeesMother.random(),
      BridgingLimitsMother.random(),
      true,
    );
  }
}
