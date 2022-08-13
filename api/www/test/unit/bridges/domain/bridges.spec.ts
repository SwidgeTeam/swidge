import { Bridges } from '../../../../src/bridges/domain/bridges';
import { createMock } from 'ts-auto-mock';
import { Bridge } from '../../../../src/bridges/domain/bridge';
import { BridgingOrder } from '../../../../src/bridges/domain/bridging-order';
import { Token } from '../../../../src/shared/domain/Token';
import { BridgingRequest } from '../../../../src/bridges/domain/bridging-request';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';

describe('bridges', () => {
  it('should filter enabled bridge correctly', () => {
    // Arrange
    const mockBridgeOne: Bridge = createMock<Bridge>({
      isEnabledOn: () => true,
    });
    const mockBridgeTwo: Bridge = createMock<Bridge>({
      isEnabledOn: () => false,
    });

    const bridges = new Bridges([
      ['k1', mockBridgeOne],
      ['k2', mockBridgeTwo],
    ]);

    // Act
    const enabled = bridges.getEnabled('1', '2');

    // Assert
    expect(enabled).toEqual(['k1']);
  });

  it('should execute on the correct bridge', async () => {
    // Arrange
    const mockBridgeOne: Bridge = createMock<Bridge>({
      isEnabledOn: () => true,
      execute: () => Promise.resolve(BridgingOrder.notRequired()),
    });
    const mockBridgeTwo: Bridge = createMock<Bridge>({
      isEnabledOn: () => false,
      execute: () => Promise.reject('error'),
    });

    const bridges = new Bridges([
      ['k1', mockBridgeOne],
      ['k2', mockBridgeTwo],
    ]);

    const request = new BridgingRequest(
      '1',
      '2',
      Token.null(),
      BigInteger.fromDecimal('100'),
      BigInteger.fromDecimal('99'),
    );

    // Act
    const result = await bridges.execute('k1', request);

    // Assert
    expect(result.required).toBeFalsy();
  });
});
