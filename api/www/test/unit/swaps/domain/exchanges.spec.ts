import { Exchange } from '../../../../src/swaps/domain/exchange';
import { createMock } from 'ts-auto-mock';
import { Token } from '../../../../src/shared/domain/Token';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { Exchanges } from '../../../../src/swaps/domain/exchanges';
import { SwapOrder } from '../../../../src/swaps/domain/SwapOrder';
import { SwapRequest } from '../../../../src/swaps/domain/SwapRequest';

describe('exchanges', () => {
  it('should filter enabled exchanges correctly', () => {
    // Arrange
    const mockExchangeOne: Exchange = createMock<Exchange>({
      isEnabledOn: (chain) => chain === '1',
    });
    const mockExchangeTwo: Exchange = createMock<Exchange>({
      isEnabledOn: (chain) => chain === '2',
    });

    const exchanges = new Exchanges([
      ['k1', mockExchangeOne],
      ['k2', mockExchangeTwo],
    ]);

    // Act
    const enabled = exchanges.getEnabled('1');

    // Assert
    expect(enabled).toEqual(['k1']);
  });

  it('should execute on the correct exchange', async () => {
    // Arrange
    const mockExchangeOne: Exchange = createMock<Exchange>({
      isEnabledOn: () => true,
      execute: (request) => Promise.resolve(SwapOrder.notRequired()),
    });
    const mockExchangeTwo: Exchange = createMock<Exchange>({
      isEnabledOn: () => false,
      execute: (request) => Promise.reject('error'),
    });

    const exchanges = new Exchanges([
      ['k1', mockExchangeOne],
      ['k2', mockExchangeTwo],
    ]);

    const request = new SwapRequest('1', Token.null(), Token.null(), BigInteger.fromDecimal('100'));

    // Act
    const result = await exchanges.execute('k1', request);

    // Assert
    expect(result.required).toBeFalsy();
  });
});
