import { Token } from '../../../../src/shared/domain/Token';

describe('Token', () => {
  it('should construct and return value', () => {
    // Arrange
    const token = new Token('NAME', '0xAddress', 18);

    // Act & Assert
    expect(token.name).toEqual('NAME');
    expect(token.address).toEqual('0xAddress');
    expect(token.decimals).toEqual(18);
  });

  it('should match upper and lower case address', () => {
    // Arrange
    const tokenUpper = new Token('NAME', '0xADDRESS', 18);
    const tokenLower = new Token('NAME', '0xaddress', 18);

    // Act & Assert
    expect(tokenLower.equals(tokenUpper)).toBeTruthy();
  });
});
