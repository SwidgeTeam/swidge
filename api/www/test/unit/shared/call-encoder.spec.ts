import { AbiEncoder } from '../../../src/shared/domain/call-encoder';
import { ethers } from 'ethers';

describe('AbiEndoder', () => {
  it('Should return a BytesLike type', () => {
    // Arrange
    const type = [
      'address',
      'address',
      'uint256',
      'address',
      'address',
      'bytes',
    ];
    const value = [
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '100000',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0x16',
    ];

    // Act
    const encodedBytes = AbiEncoder.encodeFunctionArguments(type, value);

    const expectedencoder = true;
    const receivedencoder = ethers.utils.isBytesLike(encodedBytes);

    // Assert
    expect(receivedencoder).toEqual(expectedencoder);
  });

  it('should return a 256 length', () => {
    // Arrange
    const type = [
      'address',
      'address',
      'uint256',
      'address',
      'address',
      'bytes',
    ];
    const value = [
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '100000',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0x16',
    ];

    // lenght is 32 * number of types or values
    const expectedLength = 256;

    // Act
    const encodedBytes = AbiEncoder.encodeFunctionArguments(type, value);

    // Assert
    expect(ethers.utils.hexDataLength(encodedBytes)).toEqual(expectedLength);
  });

  it('should return a 4 bytes sighash', () => {
    // Arrange
    const ABI = ['function name() view returns (string)'];
    const function_name = 'name';

    // Act
    const encodedBytes = AbiEncoder.encodeFunctionSelector(ABI, function_name);

    // Assert
    expect(ethers.utils.isBytesLike(encodedBytes)).toBeTruthy();
  });

  it('should return a length of 4 bytes', () => {
    // Arrange
    const ABI = ['function name() view returns (string)'];
    const function_name = 'name';

    const expectedlenght = 4;

    // Act
    const receivedlenght = ethers.utils.hexDataLength(
      AbiEncoder.encodeFunctionSelector(ABI, function_name),
    );

    // Assert
    expect(receivedlenght).toEqual(expectedlenght);
  });

  it('Should return a BytesLike type', () => {
    // Arrange
    const ABI = [
      'function initTokensCross(address _srcToken, address _dstToken, uint256 _srcAmount, address payable _zeroExContract, address _zeroExApproval, bytes calldata _data) external payable',
    ];
    const function_name = 'initTokensCross';
    const type = [
      'address',
      'address',
      'uint256',
      'address',
      'address',
      'bytes',
    ];
    const value = [
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '100000',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0x16',
    ];

    const expectedencoder = true; // Act
    const receivedencoder = ethers.utils.isBytesLike(
      AbiEncoder.encodeFunctionBoth(ABI, function_name, type, value),
    );

    // Assert
    expect(receivedencoder).toEqual(expectedencoder);
  });

  it('should return a 260 length', () => {
    // Arrange
    const ABI = [
      'function initTokensCross(address _srcToken, address _dstToken, uint256 _srcAmount, address payable _zeroExContract, address _zeroExApproval, bytes calldata _data) external payable',
    ];
    const function_name = 'initTokensCross';
    const type = [
      'address',
      'address',
      'uint256',
      'address',
      'address',
      'bytes',
    ];
    const value = [
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '100000',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0xAEDC090394e01E1BF8B10f744E62016a795bd697',
      '0x16',
    ];

    // lenght is 32 * number of types or values
    const expectedlenght = 260;

    // Act
    const receivedlenght = ethers.utils.hexDataLength(
      AbiEncoder.encodeFunctionBoth(ABI, function_name, type, value),
    );

    // Assert
    expect(receivedlenght).toEqual(expectedlenght);
  });
});
