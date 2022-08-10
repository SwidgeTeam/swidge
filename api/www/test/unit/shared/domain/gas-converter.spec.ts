import { GasConverter } from '../../../../src/shared/domain/GasConverter';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';

describe('GasConverter', () => {
  it('should correctly convert from destination to origin Wei', async () => {
    // Arrange
    const gasConverter = new GasConverter();
    const gasUnits = BigInteger.fromString('100000');
    const gasPrice = BigInteger.fromString('100000000');
    const priceOrigin = BigInteger.fromString('500');
    const priceDestination = BigInteger.fromString('1500');
    const expectedWei = BigInteger.fromString('3333333333333');

    // Act
    const originWei = gasConverter.convert(gasUnits, gasPrice, priceOrigin, priceDestination);

    // Assert
    expect(originWei).toEqual(expectedWei);
  });
});
