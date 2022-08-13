import { TokenMother } from '../../shared/domain/Token.mother';
import { getSushi } from '../../shared/shared';
import { Polygon } from '../../../../src/shared/enums/ChainIds';
import { LastSwapComputer } from '../../../../src/swaps/domain/last-swap-computer';
import { LastSwapComputeRequest } from '../../../../src/swaps/domain/last-swap-compute-request';
import { BigIntegerMother } from '../../shared/domain/big-integer.mother';
import { Exchanges } from '../../../../src/swaps/domain/exchanges';
import { ExchangeProviders } from '../../../../src/swaps/domain/providers/exchange-providers';
import { stub, spy } from 'sinon';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { SwapOrderMother } from './swap-order.mother';
import { LastSwapComputeRequestMother } from './last-swap-compute-request.mother';

describe('last-swap-computer', () => {
  it('should not quote anyone if the src and dst tokens are the same', async () => {
    // Arrange
    const token = TokenMother.random();
    const swapRequest = new LastSwapComputeRequest(
      Polygon,
      token,
      token,
      BigIntegerMother.random(),
      BigIntegerMother.random(),
    );
    const mockSushi = getSushi();
    stub(mockSushi, 'isEnabledOn').returns(true);
    const spyExecute = spy(mockSushi, 'execute');
    const exchanges = new Exchanges([[ExchangeProviders.Sushi, mockSushi]]);
    const swapComputer = new LastSwapComputer(exchanges);

    // Act
    const order = await swapComputer.compute(swapRequest);

    // Assert
    expect(spyExecute.notCalled).toBeTruthy();
    expect(order.required).toBeFalsy();
    expect(order.data).toEqual('0x');
  });

  it('should return default order when no possible swaps', async () => {
    // Arrange
    const swapRequest = LastSwapComputeRequestMother.random();
    const mockSushi = getSushi();
    stub(mockSushi, 'isEnabledOn').returns(true);
    const stubExecute = stub(mockSushi, 'execute').resolves(undefined);
    const exchanges = new Exchanges([[ExchangeProviders.Sushi, mockSushi]]);
    const swapComputer = new LastSwapComputer(exchanges);

    // Act
    const order = await swapComputer.compute(swapRequest);

    // Assert
    expect(stubExecute.called).toBeTruthy();
    expect(order.required).toBeFalsy();
    expect(order.data).toEqual('0x');
  });

  it('should return default order best swap does not cut the bar', async () => {
    // Arrange
    const minAmountOut = BigInteger.fromDecimal('1000');
    const expectedAmountOut = BigInteger.fromDecimal('999');
    const swapRequest = LastSwapComputeRequestMother.withMinAmountOut(minAmountOut);
    const mockSushi = getSushi();
    stub(mockSushi, 'isEnabledOn').returns(true);
    const stubExecute = stub(mockSushi, 'execute').resolves(
      SwapOrderMother.withExpectedAmountsOut(expectedAmountOut),
    );
    const exchanges = new Exchanges([[ExchangeProviders.Sushi, mockSushi]]);
    const swapComputer = new LastSwapComputer(exchanges);

    // Act
    const order = await swapComputer.compute(swapRequest);

    // Assert
    expect(stubExecute.called).toBeTruthy();
    expect(order.required).toBeFalsy();
    expect(order.data).toEqual('0x');
  });

  it('should return a complete swap order when limits are accepted', async () => {
    // Arrange
    const expectedAmountOut = BigInteger.fromDecimal('1015');
    const minAmountOut = BigInteger.fromDecimal('1000');
    const swapRequest = LastSwapComputeRequestMother.withMinAmountOut(minAmountOut);
    const mockSushi = getSushi();
    stub(mockSushi, 'isEnabledOn').returns(true);
    const stubExecute = stub(mockSushi, 'execute').resolves(
      SwapOrderMother.withExpectedAmountsOut(expectedAmountOut),
    );
    const exchanges = new Exchanges([[ExchangeProviders.Sushi, mockSushi]]);
    const swapComputer = new LastSwapComputer(exchanges);

    // Act
    const order = await swapComputer.compute(swapRequest);

    // Assert
    expect(stubExecute.calledOnce).toBeTruthy();
    expect(order.required).toBeTruthy();
    expect(order.expectedAmountOut.toDecimal()).toEqual('1015.0');
  });

  it('should reduce the slippage to try to get above the threshold', async () => {
    // Arrange
    const expectedAmountOut = BigInteger.fromDecimal('1015');
    const expectedMinAmountOut = BigInteger.fromDecimal('1000');
    const tooLowMinAmountOut = BigInteger.fromDecimal('995');
    const validMinAmountOut = BigInteger.fromDecimal('1000');
    const lastSwapRequest = LastSwapComputeRequestMother.withMinAmountOut(expectedMinAmountOut);
    const mockSushi = getSushi();
    stub(mockSushi, 'isEnabledOn').returns(true);
    const stubExecute = stub(mockSushi, 'execute')
      .onCall(0)
      .resolves(SwapOrderMother.withExpectedAmountsOut(expectedAmountOut, tooLowMinAmountOut))
      .onCall(1)
      .resolves(SwapOrderMother.withExpectedAmountsOut(expectedAmountOut, tooLowMinAmountOut))
      .onCall(2)
      .resolves(SwapOrderMother.withExpectedAmountsOut(expectedAmountOut, validMinAmountOut));
    const exchanges = new Exchanges([[ExchangeProviders.Sushi, mockSushi]]);
    const swapComputer = new LastSwapComputer(exchanges);

    // Act
    const order = await swapComputer.compute(lastSwapRequest);

    // Assert
    expect(stubExecute.calledThrice).toBeTruthy();
    expect(order.required).toBeTruthy();
    expect(order.expectedAmountOut.toDecimal()).toEqual('1015.0');
    expect(order.expectedMinAmountOut.toDecimal()).toEqual('1000.0');
  });
});
