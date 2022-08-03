import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { BridgingOrderMother } from './BridgingOrder.mother';
import { BridgingFeesMother } from './BridgingFees.mother';

describe('Bridging order', () => {
  it('should respect maximum limit', () => {
    // Arrange
    const fees = BridgingFeesMother.create(10, '1', '0', 6);
    const amount = BigInteger.fromDecimal('100');
    const order = BridgingOrderMother.randomWithFeesAndAmount(fees, amount);

    // Act
    const crossFees = order.fee;

    // Assert
    expect(crossFees.toDecimal()).toEqual('1.0');
  });

  it('should accept decimal percentage', () => {
    // Arrange
    const fees = BridgingFeesMother.create(0.1, '1', '0', 6);
    const amount = BigInteger.fromDecimal('100');
    const order = BridgingOrderMother.randomWithFeesAndAmount(fees, amount);

    // Act
    const crossFees = order.fee;

    // Assert
    expect(crossFees.toDecimal()).toEqual('0.1');
  });

  it('should respect minimum limit', () => {
    // Arrange
    const fees = BridgingFeesMother.create(10, '100', '50', 6);
    const amount = BigInteger.fromDecimal('100');
    const order = BridgingOrderMother.randomWithFeesAndAmount(fees, amount);

    // Act
    const crossFees = order.fee;

    // Assert
    expect(crossFees.toDecimal()).toEqual('50.0');
  });

  it('should respect percentage if inside limits', () => {
    // Arrange
    const fees = BridgingFeesMother.create(10, '100', '0', 6);
    const amount = BigInteger.fromDecimal('100');
    const order = BridgingOrderMother.randomWithFeesAndAmount(fees, amount);

    // Act
    const crossFees = order.fee;

    // Assert
    expect(crossFees.toDecimal()).toEqual('10.0');
  });
});
