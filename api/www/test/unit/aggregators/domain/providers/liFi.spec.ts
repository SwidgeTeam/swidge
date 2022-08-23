import { AggregatorRequest } from '../../../../../src/aggregators/domain/aggregator-request';
import { TokenMother } from '../../../shared/domain/token.mother';
import { BigInteger } from '../../../../../src/shared/domain/big-integer';
import { faker } from '@faker-js/faker';
import { LiFi } from '../../../../../src/aggregators/domain/providers/liFi';
import { createMock } from 'ts-auto-mock';
import LIFI from '@lifi/sdk';

describe('liFi aggregator', () => {
  it('should throw exception if request fails', async () => {
    // Arrange
    const liFiClient = createMock<LIFI>({
      getQuote: () => Promise.reject(new Error('error')),
    });
    const liFi = new LiFi(liFiClient);
    const request = getAggregatorRequest();

    // Act
    const call = liFi.execute(request);

    // Assert
    await expect(call).rejects.toEqual(new Error('INSUFFICIENT_LIQUIDITY'));
  });
});

function getAggregatorRequest() {
  return new AggregatorRequest(
    '137',
    '250',
    TokenMother.polygonLink(),
    TokenMother.fantomUsdc(),
    BigInteger.fromDecimal('100'),
    2,
    faker.finance.ethereumAddress(),
    faker.finance.ethereumAddress(),
  );
}

/**
 it('should filter enabled aggregators correctly', async () => {
    // Arrange
    const socket = new Socket(new HttpClient());
    const request = new AggregatorRequest(
      '137',
      '250',
      TokenMother.polygonLink(),
      TokenMother.fantomUsdc(),
      BigInteger.fromDecimal('100'),
      2,
    );

    // Act
    const route = await socket.execute(request);

    // Assert
    console.log(route);
  });
 */
