import { BridgingFees } from '../../../../src/bridges/domain/BridgingFees';
import { randomWithFees } from './BridgingOrder.mother';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';

describe('Bridging order', () => {
  it('should respect maximum limit', () => {
    // Arrange
    const fees = new BridgingFees(
      10,
      BigInteger.fromDecimal('1'),
      BigInteger.fromDecimal('0'),
    );
    const order = randomWithFees(fees);
    const amount = BigInteger.fromDecimal('100');

    // Act
    const crossFees = order.finalFee(amount);

    // Assert
    expect(crossFees.toDecimal()).toEqual('1.0');
  });

  it('should accept decimal percentage', () => {
    // Arrange
    const fees = new BridgingFees(
      0.1,
      BigInteger.fromDecimal('1'),
      BigInteger.fromDecimal('0'),
    );
    const order = randomWithFees(fees);
    const amount = BigInteger.fromDecimal('100');

    // Act
    const crossFees = order.finalFee(amount);

    // Assert
    expect(crossFees.toDecimal()).toEqual('0.1');
  });

  it('should respect minimum limit', () => {
    // Arrange
    const fees = new BridgingFees(
      10,
      BigInteger.fromDecimal('100'),
      BigInteger.fromDecimal('50'),
    );
    const order = randomWithFees(fees);
    const amount = BigInteger.fromDecimal('100');

    // Act
    const crossFees = order.finalFee(amount);

    // Assert
    expect(crossFees.toDecimal()).toEqual('50.0');
  });

  it('should respect percentage if inside limits', () => {
    // Arrange
    const fees = new BridgingFees(
      10,
      BigInteger.fromDecimal('100'),
      BigInteger.fromDecimal('0'),
    );
    const order = randomWithFees(fees);
    const amount = BigInteger.fromDecimal('100');

    // Act
    const crossFees = order.finalFee(amount);

    // Assert
    expect(crossFees.toDecimal()).toEqual('10.0');
  });
});
