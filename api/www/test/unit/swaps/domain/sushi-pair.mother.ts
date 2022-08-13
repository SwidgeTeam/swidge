import { SushiPair } from '../../../../src/swaps/domain/sushi-pair';
import { BigInteger } from '../../../../src/shared/domain/big-integer';
import { Token } from '../../../../src/shared/domain/token';
import { Polygon } from '../../../../src/shared/enums/ChainIds';
import { TokenMother } from '../../shared/domain/token.mother';

export class SushiPairMother {
  public static create(
    id: string,
    chainId: string,
    token0: Token,
    token1: Token,
    reserve0: BigInteger,
    reserve1: BigInteger,
  ): SushiPair {
    return new SushiPair(id, chainId, token0, token1, reserve0, reserve1);
  }

  public static linkUsdc(): SushiPair {
    return this.create(
      'id_link',
      Polygon,
      TokenMother.link(),
      TokenMother.usdc(),
      BigInteger.fromDecimal('10000'),
      BigInteger.fromDecimal('10000'),
    );
  }

  public static sushiUsdc(): SushiPair {
    return this.create(
      'id_sushi',
      Polygon,
      TokenMother.sushi(),
      TokenMother.usdc(),
      BigInteger.fromDecimal('10000'),
      BigInteger.fromDecimal('10000'),
    );
  }
}
