import { BridgingOrder } from '../../../../src/bridges/domain/bridging-order';
import { BridgingFees } from '../../../../src/bridges/domain/BridgingFees';
import { BridgingLimits } from '../../../../src/bridges/domain/BridgingLimits';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { Tokens } from '../../../../src/shared/enums/Tokens';
import { USDC } from '../../../../src/shared/enums/TokenSymbols';
import { Mainnet, Polygon } from '../../../../src/shared/enums/ChainIds';

export function randomWithFees(fees: BridgingFees) {
  const limits = new BridgingLimits(
    BigInteger.fromDecimal('0'),
    BigInteger.fromDecimal('0'),
    BigInteger.fromDecimal('0'),
    18,
  );
  return new BridgingOrder(
    BigInteger.fromDecimal('1'),
    Tokens[USDC][Mainnet],
    Tokens[USDC][Polygon],
    Polygon,
    '',
    fees,
    limits,
    true,
  );
}
