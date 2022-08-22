import { createMock } from 'ts-auto-mock';
import EventProcessor from '../../../src/eventsConsumer/domain/event-processor';
import { Logger } from '../../../src/shared/domain/logger';
import { method, On } from 'ts-auto-mock/extension';
import { Producer } from 'sqs-producer';
import { TransactionsRepository } from '../../../src/persistence/domain/transactions-repository';

describe('event-consumer', () => {
  it('should pass arguments correctly on swapExecuted', async () => {
    // Arrange
    const producerMock = createMock<Producer>();
    const loggerMock = createMock<Logger>();
    const repositoryMock = createMock<TransactionsRepository>();
    const spyCreate = On(repositoryMock).get(method('create'));
    const spyUpdate = On(repositoryMock).get(method('update'));
    const processor = new EventProcessor(producerMock, repositoryMock, loggerMock);

    // Act
    await processor.swapExecuted({
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
      toChainId: 'chainId',
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

  it('should pass arguments correctly on crossInitiated', async () => {
    // Arrange
    const producerMock = createMock<Producer>();
    const loggerMock = createMock<Logger>();
    const repositoryMock = createMock<TransactionsRepository>();
    const spyCreate = On(repositoryMock).get(method('create'));
    const spyUpdate = On(repositoryMock).get(method('update'));
    const spySend = On(producerMock).get(method('send'));
    const processor = new EventProcessor(producerMock, repositoryMock, loggerMock);

    // Act
    await processor.crossInitiated({
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
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(spySend).toHaveBeenCalledTimes(1);

    expect(spyCreate).toHaveBeenCalledWith({
      txHash: 'txHash',
      walletAddress: 'wallet',
      routerAddress: 'routerAddress',
      receiver: 'receiver',
      fromChainId: 'fromChain',
      toChainId: 'toChain',
      srcToken: 'srcToken',
      bridgeTokenIn: 'bridgeTokenIn',
      bridgeTokenOut: 'bridgeTokenOut',
      dstToken: 'dstToken',
      amountIn: 'amountIn',
    });
    expect(spyUpdate).toHaveBeenCalledWith({
      txHash: 'txHash',
      bridgeAmountIn: 'amountCross',
    });
    expect(spySend.mock.calls[0][0].id).toEqual('txHash');
    expect(spySend.mock.calls[0][0].body).toEqual(
      JSON.stringify({
        txHash: 'txHash',
        receiver: 'receiver',
        fromChain: 'fromChain',
        toChain: 'toChain',
        srcToken: 'bridgeTokenOut',
        dstToken: 'dstToken',
        router: 'routerAddress',
        minAmount: 'minAmountOut',
      }),
    );
    expect(spySend.mock.calls[0][0].groupId).toEqual('receiver');
    expect(spySend.mock.calls[0][0].deduplicationId).toEqual('txHash');
  });

  it('should pass arguments correctly on crossFinalized', async () => {
    // Arrange
    const producerMock = createMock<Producer>();
    const loggerMock = createMock<Logger>();
    const repositoryMock = createMock<TransactionsRepository>();
    const spyUpdate = On(repositoryMock).get(method('update'));
    const processor = new EventProcessor(producerMock, repositoryMock, loggerMock);
    const date = new Date();

    // Act
    await processor.crossFinalized({
      txHash: 'txHash',
      destinationTxHash: 'destinationTxHash',
      amountOut: 'amountOut',
      completed: date,
    });

    // Assert
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(spyUpdate).toHaveBeenCalledWith({
      txHash: 'txHash',
      destinationTxHash: 'destinationTxHash',
      amountOut: 'amountOut',
      completed: date,
    });
  });

  it('should pass arguments correctly on multichainDelivered', async () => {
    // Arrange
    const producerMock = createMock<Producer>();
    const loggerMock = createMock<Logger>();
    const repositoryMock = createMock<TransactionsRepository>();
    const spyUpdate = On(repositoryMock).get(method('update'));
    const processor = new EventProcessor(producerMock, repositoryMock, loggerMock);
    const date = new Date();

    // Act
    await processor.multichainDelivered({
      originTxHash: 'originTxHash',
      amountOut: 'amountOut',
      bridged: date,
    });

    // Assert
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(spyUpdate).toHaveBeenCalledWith({
      txHash: 'originTxHash',
      bridged: date,
      bridgeAmountOut: 'amountOut',
    });
  });
});
