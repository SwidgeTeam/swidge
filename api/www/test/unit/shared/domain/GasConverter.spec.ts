import { GasConverter } from '../../../../src/shared/domain/GasConverter';
import { BigNumber } from 'ethers';

describe('GasConverter', () => {
  it('should correctly convert from destination to origin Wei', async () => {
    // Arrange
    const gasConverter = new GasConverter();
    const gasUnits = BigNumber.from('100000');
    const gasPrice = BigNumber.from('100000000');
    const priceOrigin = BigNumber.from('500');
    const priceDestination = BigNumber.from('1500');
    const expectedWei = BigNumber.from('3333333333333');

    // Act
    const originWei = await gasConverter.convert(gasUnits, gasPrice, priceOrigin, priceDestination);

    // Assert
    expect(originWei).toEqual(expectedWei);
  });
});
