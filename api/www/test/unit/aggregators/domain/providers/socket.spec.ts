import { Socket } from '../../../../../src/aggregators/domain/providers/socket';
import { AggregatorRequest } from '../../../../../src/aggregators/domain/aggregator-request';
import { TokenMother } from '../../../shared/domain/token.mother';
import { BigInteger } from '../../../../../src/shared/domain/big-integer';
import { httpClientMock } from '../../../shared/shared';
import { faker } from '@faker-js/faker';
import { BigIntegerMother } from '../../../shared/domain/big-integer.mother';

describe('aggregators', () => {
  it('should throw exception if request fails', async () => {
    // Arrange
    const httpClient = httpClientMock({
      get: () => Promise.reject('error'),
    });
    const socket = new Socket(httpClient, '');
    const request = getAggregatorRequest();

    // Act
    const call = socket.execute(request);

    // Assert
    await expect(call).rejects.toEqual('error');
  });

  it('should throw exception if request status failed', async () => {
    // Arrange
    const httpClient = httpClientMock({
      get: () =>
        Promise.resolve({
          success: false,
        }),
    });
    const socket = new Socket(httpClient, '');
    const request = getAggregatorRequest();

    // Act
    const call = socket.execute(request);

    // Assert
    await expect(call).rejects.toEqual(new Error('INSUFFICIENT_LIQUIDITY'));
  });

  it('should throw exception if request doesnt return routes', async () => {
    // Arrange
    const httpClient = httpClientMock({
      get: () =>
        Promise.resolve({
          success: true,
          result: {
            routes: [],
          },
        }),
    });
    const socket = new Socket(httpClient, '');
    const request = getAggregatorRequest();

    // Act
    const call = socket.execute(request);

    // Assert
    await expect(call).rejects.toEqual(new Error('INSUFFICIENT_LIQUIDITY'));
  });

  it('should return a correct route', async () => {
    // Arrange
    const fromAddress1 = faker.finance.ethereumAddress();
    const toAddress1 = faker.finance.ethereumAddress();
    const fromAddress2 = faker.finance.ethereumAddress();
    const toAddress2 = faker.finance.ethereumAddress();
    const txTo = faker.finance.ethereumAddress();
    const txApprove = faker.finance.ethereumAddress();
    const value = BigIntegerMother.random();

    const httpClient = httpClientMock({
      get: () =>
        Promise.resolve({
          success: true,
          result: {
            routes: [
              {
                routeId: faker.random.word(),
                toAmount: '1000000',
                userTxs: [
                  {
                    steps: [
                      {
                        type: 'middleware',
                        protocol: {
                          displayName: 'DEX',
                          icon: 'icon1',
                        },
                        fromAsset: {
                          address: fromAddress1,
                          symbol: 'FROM',
                          decimals: 18,
                          name: 'FROM',
                        },
                        toAsset: {
                          address: toAddress1,
                          symbol: 'TO',
                          decimals: 6,
                          name: 'TO',
                        },
                        fromAmount: '100000000000000000000',
                        toAmount: '150000000',
                        gasFees: {
                          gasLimit: 121212,
                          feesInUsd: 0.567,
                        },
                      },
                      {
                        type: 'bridge',
                        protocol: {
                          displayName: 'Bridge',
                          icon: 'icon2',
                        },
                        fromAsset: {
                          address: fromAddress2,
                          symbol: 'TO',
                          decimals: 6,
                          name: 'TO',
                        },
                        toAsset: {
                          address: toAddress2,
                          symbol: 'FROM',
                          decimals: 18,
                          name: 'FROM',
                        },
                        fromAmount: '150000000',
                        toAmount: '100000000000000000000',
                        gasFees: {
                          gasLimit: 121212,
                          feesInUsd: 0.567,
                        },
                      },
                    ],
                    serviceTime: 600,
                    gasFees: {
                      gasAmount: '92468358000000000',
                      gasLimit: 1744686,
                      feesInUsd: '189.9',
                    },
                  },
                ],
              },
            ],
          },
        }),
      post: () =>
        Promise.resolve({
          result: {
            txData: '0xdata',
            txTarget: txTo,
            value: value.toString(),
            approvalData: {
              allowanceTarget: txApprove,
            },
          },
        }),
    });
    const socket = new Socket(httpClient, '');
    const request = getAggregatorRequest();

    // Act
    const route = await socket.execute(request);

    // Assert
    expect(route.transaction.to).toEqual(txTo);
    expect(route.transaction.callData).toEqual('0xdata');
    expect(route.fees.feeInUsd).toEqual('189.9');
    expect(route.fees.nativeWei.toString()).toEqual('92468358000000000');
    expect(route.steps.length).toEqual(2);
    expect(route.steps[0].type).toEqual('swap');
    expect(route.steps[0].amountOut.toString()).toEqual('150000000');
    expect(route.steps[1].type).toEqual('bridge');
    expect(route.steps[1].amountOut.toString()).toEqual('100000000000000000000');
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
