import { ZeroEx } from '../../../../../src/swaps/domain/providers/zero-ex';
import { httpClientMock } from '../../../shared/shared';
import { SwapRequest } from '../../../../../src/swaps/domain/swap-request';
import { Polygon } from '../../../../../src/shared/enums/ChainIds';
import { TokenMother } from '../../../shared/domain/token.mother';
import { BigIntegerMother } from '../../../shared/domain/big-integer.mother';
import { BigInteger } from '../../../../../src/shared/domain/big-integer';
import { faker } from '@faker-js/faker';
import { ethers } from 'ethers';

describe('zero-ex', () => {
  it('should throw exception if request fails', () => {
    // Arrange
    const httpClient = httpClientMock({
      get: () => Promise.reject(),
    });
    const zeroEx = new ZeroEx(httpClient);
    const swapRequest = new SwapRequest(
      Polygon,
      TokenMother.random(),
      TokenMother.random(),
      1,
      BigIntegerMother.random(),
      BigIntegerMother.random(),
    );

    // Act
    const call = zeroEx.execute(swapRequest);

    // Assert
    expect(call).rejects.toEqual(new Error('INSUFFICIENT_LIQUIDITY'));
  });

  it('should return a correctly constructed order', async () => {
    // Arrange
    const zeroExHandler = faker.finance.ethereumAddress();
    const receivedData = '0x12341234';
    const httpClient = httpClientMock({
      get: () =>
        Promise.resolve({
          to: zeroExHandler,
          allowanceTarget: faker.finance.ethereumAddress(),
          data: receivedData,
          buyAmount: '12345612',
          guaranteedPrice: '1.123456',
          gas: '500000',
        }),
    });
    const encodedAddress = ethers.utils.defaultAbiCoder.encode(['address'], [zeroExHandler]);
    const orderData = ethers.utils.hexConcat([encodedAddress, receivedData]);
    const zeroEx = new ZeroEx(httpClient);
    const link = TokenMother.link();
    const usdc = TokenMother.usdc();
    const swapRequest = new SwapRequest(
      Polygon,
      link,
      usdc,
      2,
      BigInteger.fromDecimal('10'),
      BigInteger.fromDecimal('9'),
    );

    // Act
    const swapOrder = await zeroEx.execute(swapRequest);

    // Assert
    expect(swapOrder.providerCode).toEqual('0');
    expect(swapOrder.data).toEqual(orderData);
    expect(swapOrder.required).toBeTruthy();
    expect(swapOrder.amountIn.toDecimal()).toEqual('10.0');
    expect(swapOrder.expectedAmountOut.toString()).toEqual('12345612');
    expect(swapOrder.expectedMinAmountOut.toString()).toEqual('11234560');
    expect(swapOrder.worstCaseAmountOut.toString()).toEqual('10111104');
    expect(swapOrder.tokenIn).toEqual(link);
    expect(swapOrder.tokenOut).toEqual(usdc);
  });
});
