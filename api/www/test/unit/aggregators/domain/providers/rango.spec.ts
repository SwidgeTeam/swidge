import { AggregatorRequest } from '../../../../../src/aggregators/domain/aggregator-request';
import { TokenMother } from '../../../shared/domain/token.mother';
import { BigInteger } from '../../../../../src/shared/domain/big-integer';
import { faker } from '@faker-js/faker';
import { Rango } from '../../../../../src/aggregators/domain/providers/rango';
import { QuoteRequest, QuoteResponse, RangoClient } from 'rango-sdk-basic';
import { createMock } from 'ts-auto-mock';
import { AggregatorProviders } from '../../../../../src/aggregators/domain/providers/aggregator-providers';

jest.setTimeout(12000);

describe('aggregators', () => {
  it('should throw exception if request fails', async () => {
    // Arrange
    const rango = new Rango(new RangoClient('7b3d45e1-fdc1-4642-be95-3b8a8c6aebcf'));
    const request = new AggregatorRequest(
      '137',
      '250',
      TokenMother.polygonLink(),
      TokenMother.fantomUsdc(),
      BigInteger.fromDecimal('100'),
      2,
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
    );

    // Act
    const t1 = new Date().getTime();
    const route = await rango.swap(request);
    const t2 = new Date().getTime();
    console.log(t2-t1);
    //const route = await rango.meta();

    // Assert
  });
});

function getAggregatorRoute() {
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
 it('should throw exception if request fails', async () => {
    // Arrange
    const rango = new Rango(new RangoClient('7b3d45e1-fdc1-4642-be95-3b8a8c6aebcf'));
    const request = new AggregatorRequest(
      '137',
      '250',
      TokenMother.polygonLink(),
      TokenMother.fantomUsdc(),
      BigInteger.fromDecimal('100'),
      2,
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
    );

    // Act
    const route = await rango.execute(request);
    //const route = await rango.meta();

    // Assert
  });

 */
