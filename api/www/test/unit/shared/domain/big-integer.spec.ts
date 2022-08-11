import { BigInteger } from '../../../../src/shared/domain/BigInteger';

describe('BigInteger', () => {
  it('should have 18 decimals by default', () => {
    // Arrange
    const number = BigInteger.fromDecimal('1');

    // Act
    const stringNumber = number.toString();

    // Assert
    expect(stringNumber).toEqual('1000000000000000000');
  });

  it('should return a zero value', () => {
    // Arrange
    const number = BigInteger.zero();

    // Act
    const stringNumber = number.toString();

    // Assert
    expect(stringNumber).toEqual('0');
  });

  it('should have configurable decimals', () => {
    // Arrange
    const number = BigInteger.fromDecimal('1', 6);

    // Act
    const stringNumber = number.toString();

    // Assert
    expect(stringNumber).toEqual('1000000');
  });

  it('should hold big numbers correctly correctly', () => {
    // Arrange
    const number = BigInteger.fromDecimal('123456789123456789');

    // Act
    const stringNumber = number.toString();

    // Assert
    expect(stringNumber).toEqual('123456789123456789000000000000000000');
  });

  it('should hold big decimals correctly correctly', () => {
    // Arrange
    const number = BigInteger.fromDecimal('1.23456789123456789');

    // Act
    const stringNumber = number.toString();

    // Assert
    expect(stringNumber).toEqual('1234567891234567890');
  });

  it('should construct from already bigNumber value', () => {
    // Arrange
    const number = BigInteger.fromString('123456789123456789');

    // Act
    const stringNumber = number.toString();

    // Assert
    expect(stringNumber).toEqual('123456789123456789');
  });

  /* Formats */

  it('should format default decimals from bigNumber', () => {
    // Arrange
    const number = BigInteger.fromString('1234567891234567890');

    // Act
    const stringNumber = number.toDecimal();

    // Assert
    expect(stringNumber).toEqual('1.23456789123456789');
  });

  it('should format custom decimals from bigNumber', () => {
    // Arrange
    const number = BigInteger.fromString('123456789123456789');

    // Act
    const stringNumber = number.toDecimal(10);

    // Assert
    expect(stringNumber).toEqual('12345678.9123456789');
  });

  /* Operations */

  it('should sum correctly', () => {
    // Arrange
    const numberOne = BigInteger.fromDecimal('10', 6);
    const numberTwo = BigInteger.fromDecimal('20', 6);

    // Act
    const finalNumber = numberOne.plus(numberTwo);

    // Assert
    expect(finalNumber.toString()).toEqual('30000000');
  });

  it('should subtract correctly', () => {
    // Arrange
    const numberOne = BigInteger.fromDecimal('20', 6);
    const numberTwo = BigInteger.fromDecimal('10', 6);

    // Act
    const finalNumber = numberOne.minus(numberTwo);

    // Assert
    expect(finalNumber.toString()).toEqual('10000000');
  });

  it('should multiply correctly', () => {
    // Arrange
    const numberOne = BigInteger.fromDecimal('10', 6);

    // Act
    const finalNumber = numberOne.times(10);

    // Assert
    expect(finalNumber.toString()).toEqual('100000000');
  });

  it('should divide correctly', () => {
    // Arrange
    const numberOne = BigInteger.fromDecimal('10', 6);

    // Act
    const finalNumber = numberOne.div(10);

    // Assert
    expect(finalNumber.toString()).toEqual('1000000');
  });

  it('should be comparable on lessThan', () => {
    // Arrange
    const numberOne = BigInteger.fromDecimal('10', 6);
    const numberTwo = BigInteger.fromDecimal('20', 6);

    // Act && Assert
    expect(numberOne.lessThan(numberTwo)).toBeTruthy();
    expect(numberTwo.lessThan(numberOne)).toBeFalsy();
    expect(numberTwo.lessThan(numberTwo)).toBeFalsy();
  });

  it('should be comparable on greaterThan', () => {
    // Arrange
    const numberOne = BigInteger.fromDecimal('20', 6);
    const numberTwo = BigInteger.fromDecimal('10', 6);

    // Act && Assert
    expect(numberOne.greaterThan(numberTwo)).toBeTruthy();
    expect(numberTwo.greaterThan(numberOne)).toBeFalsy();
    expect(numberTwo.greaterThan(numberTwo)).toBeFalsy();
  });

  it('should equal correctly', () => {
    // Arrange
    const numberOne = BigInteger.fromDecimal('20', 6);
    const numberTwo = BigInteger.fromDecimal('10', 6);
    const numberThree = BigInteger.fromDecimal('20', 6);
    const numberFour = BigInteger.fromDecimal('10', 18);

    // Act && Assert
    expect(numberOne.equals(numberTwo)).toBeFalsy();
    expect(numberOne.equals(numberThree)).toBeTruthy();
    expect(numberTwo.equals(numberFour)).toBeFalsy();
  });

  it('should operate the remaining percentage', () => {
    // Arrange
    const total = BigInteger.fromDecimal('100', 18);
    const percent = 1.5;

    // Act
    const another = total.subtractPercentage(percent);

    // Assert
    expect(another.toDecimal(18)).toEqual('98.5');
  });
});
