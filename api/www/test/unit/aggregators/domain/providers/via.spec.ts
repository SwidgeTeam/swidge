import { Socket } from '../../../../../src/aggregators/domain/providers/socket';
import { AggregatorRequest } from '../../../../../src/aggregators/domain/aggregator-request';
import { TokenMother } from '../../../shared/domain/token.mother';
import { BigInteger } from '../../../../../src/shared/domain/big-integer';
import { httpClientMock } from '../../../shared/shared';
import { faker } from '@faker-js/faker';
import { BigIntegerMother } from '../../../shared/domain/big-integer.mother';
import { HttpClient } from '../../../../../src/shared/infrastructure/http/httpClient';
import { ViaExchange } from '../../../../../src/aggregators/domain/providers/via-exchange';

jest.setTimeout(12000);

describe('aggregators', () => {
  it('should throw exception if request fails', async () => {
    // Arrange
    const socket = new ViaExchange();
    const request = new AggregatorRequest(
      '137',
      '250',
      TokenMother.polygonLink(),
      TokenMother.fantomUsdc(),
      BigInteger.fromDecimal('100'),
      2,
      '0xc99F374E96Fb1c2eEAFe92596bEd04aa1397971c',
      '0xc99F374E96Fb1c2eEAFe92596bEd04aa1397971c',
    );

    // Act
    await socket.execute(request);

    // Assert
  });
});
