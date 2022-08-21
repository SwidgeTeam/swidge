import { createMock } from 'ts-auto-mock';
import EventProcessor from '../../../src/eventsConsumer/domain/event-processor';
import { Logger } from '../../../src/shared/domain/logger';
import { method, On } from 'ts-auto-mock/extension';
import { Producer } from 'sqs-producer';
import { TransactionsRepository } from '../../../src/persistence/domain/transactions-repository';

describe('event-consumer', () => {
  it('should pass arguments correctly on swapExecuted', () => {
    // Arrange
    const producerMock = createMock<Producer>();
    const loggerMock = createMock<Logger>();
    const repositoryMock = createMock<TransactionsRepository>();
    const spyCreate = On(repositoryMock).get(method('create'));
    const spyUpdate = On(repositoryMock).get(method((mock) => mock.update));
    const processor = new EventProcessor(producerMock, repositoryMock, loggerMock);

    // Act
    processor.swapExecuted({
      txHash: 'txHash',
      routerAddress: 'routerAddress',
      wallet: 'wallet',
      chainId: 'chainId',
      srcToken: 'srcToken',
      dstToken: 'dstToken',
      amountIn: 'amountIn',
      amountOut: 'amountOut',
    });

    // Assert
    expect(spyCreate).toHaveBeenCalledTimes(1);
    expect(spyUpdate).toHaveBeenCalledTimes(1);

    expect(spyCreate).toHaveBeenCalledWith({
      txHash: 'txHash',
      walletAddress: 'wallet',
      routerAddress: 'routerAddress',
      fromChainId: 'chainId',
      toChainId: 'cainId',
      srcToken: 'srcToken',
      bridgeTokenIn: '',
      bridgeTokenOut: '',
      dstToken: 'dstToken',
      amountIn: 'amountIn',
    });
    expect(spyUpdate).toHaveBeenCalledWith({
      txHash: 'txHash',
      amountOut: 'amountOut',
    });
  });

  it('should pass arguments correctly on crossInitiated', () => {
    // Arrange
    const producerMock = createMock<Producer>();
    const loggerMock = createMock<Logger>();
    const repositoryMock = createMock<TransactionsRepository>();
    const spyCreate = On(repositoryMock).get(method('create'));
    const spyUpdate = On(repositoryMock).get(method((mock) => mock.update));
    const spySend = On(producerMock).get(method((mock) => mock.send));
    const processor = new EventProcessor(producerMock, repositoryMock, loggerMock);

    // Act
    processor.crossInitiated({
      txHash: 'txHash',
      routerAddress: 'routerAddress',
      wallet: 'wallet',
      receiver: 'receiver',
      fromChain: 'fromChain',
      toChain: 'toChain',
      srcToken: 'srcToken',
      bridgeTokenIn: 'bridgeTokenIn',
      bridgeTokenOut: 'bridgeTokenOut',
      dstToken: 'dstToken',
      amountIn: 'amountIn',
      amountCross: 'amountCross',
      minAmountOut: 'minAmountOut',
    });

    // Assert
    expect(spyCreate).toHaveBeenCalledTimes(1);
    //expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(spySend).toHaveBeenCalledTimes(1);

    expect(spyCreate).toHaveBeenCalledWith({
      txHash: 'txHash',
      walletAddress: 'wallet',
      routerAddress: 'routerAddress',
      receiver: 'receiver',
      fromChainId: 'fromChainId',
      toChainId: 'toChainId',
      srcToken: 'srcToken',
      bridgeTokenIn: 'bridgeTokenIn',
      bridgeTokenOut: 'bridgeTokenOut',
      dstToken: 'dstToken',
      amountIn: 'amountIn',
    });
    expect(spyUpdate).toHaveBeenCalledWith({
      txHash: 'txHash',
      bridgeAmountIn: 'bridgeAmountIn',
    });
  });
});
