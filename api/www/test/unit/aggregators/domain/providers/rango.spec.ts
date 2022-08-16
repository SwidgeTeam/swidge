import { Socket } from '../../../../../src/aggregators/domain/providers/socket';
import { AggregatorRequest } from '../../../../../src/aggregators/domain/aggregator-request';
import { TokenMother } from '../../../shared/domain/token.mother';
import { BigInteger } from '../../../../../src/shared/domain/big-integer';
import { ConfigService } from '../../../../../src/config/config.service';
import { faker } from '@faker-js/faker';
import { BigIntegerMother } from '../../../shared/domain/big-integer.mother';
import { createMock } from 'ts-auto-mock';
import { Rango } from '../../../../../src/aggregators/domain/providers/rango';

describe('aggregators', () => {
  it('should throw exception if request fails', async () => {
    it('should filter enabled aggregators correctly', async () => {
      // Arrange
      const configService = createMock<ConfigService>({
        getRangoApiKey: () => '',
      });
      const rango = new Rango(configService);
      const request = new AggregatorRequest(
        '137',
        '250',
        TokenMother.polygonLink(),
        TokenMother.fantomUsdc(),
        BigInteger.fromDecimal('100'),
        2,
      );

      // Act
      const route = await rango.execute(request);

      // Assert
      console.log(route);
    });
  });

});

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
