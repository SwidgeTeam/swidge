import { Aggregator } from '../../../../src/aggregators/domain/aggregator';
import { Aggregators } from '../../../../src/aggregators/domain/aggregators';
import { createMock } from 'ts-auto-mock';
import { AggregatorRequest } from '../../../../src/aggregators/domain/aggregator-request';
import { RouteMother } from '../../shared/domain/route.mother';
import { TokenMother } from '../../shared/domain/token.mother';
import { BigIntegerMother } from '../../shared/domain/big-integer.mother';
import { faker } from '@faker-js/faker';
import { PriceFeed } from '../../../../src/shared/domain/PriceFeed';
import { BigInteger } from '../../../../src/shared/domain/big-integer';

describe('aggregators', () => {
  it('should filter enabled aggregators correctly', () => {
    // Arrange
    const mockAggregatorOne: Aggregator = createMock<Aggregator>({
      isEnabledOn: () => true,
    });
    const mockAggregatorTwo: Aggregator = createMock<Aggregator>({
      isEnabledOn: () => false,
    });

    const exchanges = new Aggregators([
      ['k1', mockAggregatorOne],
      ['k2', mockAggregatorTwo],
    ]);

    // Act
    const enabled = exchanges.getEnabled('1', '2');

    // Assert
    expect(enabled).toEqual(['k1']);
  });

  it('should execute on the correct aggregator', async () => {
    // Arrange
    const routeOne = RouteMother.randomCrossChain();
    const routeTwo = RouteMother.randomCrossChain();
    const mockAggregatorOne: Aggregator = createMock<Aggregator>({
      isEnabledOn: () => true,
      execute: () => Promise.resolve(routeOne),
    });
    const mockAggregatorTwo: Aggregator = createMock<Aggregator>({
      isEnabledOn: () => false,
      execute: () => Promise.resolve(routeTwo),
    });

    const aggregators = new Aggregators([
      ['k1', mockAggregatorOne],
      ['k2', mockAggregatorTwo],
    ]);

    const request = new AggregatorRequest(
      '1',
      '2',
      TokenMother.random(),
      TokenMother.random(),
      BigIntegerMother.random(),
      2,
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
    );

    // Act
    const route = await aggregators.execute('k1', request, BigInteger.zero(), PriceFeed.zero());

    // Assert
    expect(route.transaction.to).toEqual(routeOne.transaction.to);
    expect(route.transaction.callData).toEqual(routeOne.transaction.callData);
  });
});
