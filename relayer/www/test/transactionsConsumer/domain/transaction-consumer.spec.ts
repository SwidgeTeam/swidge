import { createMock } from 'ts-auto-mock';
import { RouterCaller } from '../../../src/transactionsConsumer/infrastructure/router-caller';
import { Logger } from '../../../src/shared/domain/logger';
import { ConfigService } from '../../../src/config/config.service';
import { HttpClient } from '../../../src/shared/http/httpClient';
import { Transaction } from '../../../src/persistence/domain/transaction';
import { TransactionsRepositoryImpl } from '../../../src/persistence/infrastructure/transactions-repository';
import TransactionConsumer from '../../../src/transactionsConsumer/domain/transaction-consumer';
import { stub } from 'sinon';
import { createMessage } from '../../shared';
import { BigNumber } from 'ethers';
import { SwapOrder } from '../../../src/persistence/domain/swap-order';
import { method, On } from 'ts-auto-mock/extension';

describe('transaction-consumer', () => {
  it('should throw error if tx is not found', async () => {
    // Arrange
    const routerCaller = createMock<RouterCaller>();
    const loggerMock = createMock<Logger>();
    const repositoryMock = getTransactionRepositoryMock();
    stub(repositoryMock, 'getTx').resolves(null);
    const consumer = new TransactionConsumer(routerCaller, repositoryMock, loggerMock);
    const message = getMessage();

    // Act
    const call = consumer.process(message);

    // Assert
    await expect(call).rejects.toEqual(new Error('!! Tx not indexed !!'));
  });

  it('should throw error if tx is not yet bridged', async () => {
    // Arrange
    const routerCaller = createMock<RouterCaller>();
    const loggerMock = createMock<Logger>();
    const repositoryMock = getTransactionRepositoryMock();
    const transaction = new Transaction(
      'txHash',
      'walletAddress',
      'routerAddress',
      'fromChainId',
      'toChainId',
      'srcToken',
      'bridgeTokenIn',
      'bridgeTokenOut',
      'dstToken',
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(0),
      BigNumber.from(0),
      new Date(),
      null,
      null,
    );
    stub(repositoryMock, 'getTx').resolves(transaction);
    const consumer = new TransactionConsumer(routerCaller, repositoryMock, loggerMock);
    const message = getMessage();

    // Act
    const call = consumer.process(message);

    // Assert
    await expect(call).rejects.toEqual(new Error('Tx not bridged yet'));
  });

  it('should quote swap when tx is bridged', async () => {
    // Arrange
    const routerCaller = createMock<RouterCaller>();
    const spyRouterCall = On(routerCaller).get(method('call'));
    const loggerMock = createMock<Logger>();
    const repositoryMock = getTransactionRepositoryMock();
    const transaction = new Transaction(
      'txHash',
      'walletAddress',
      'routerAddress',
      'fromChainId',
      'toChainId',
      'srcToken',
      'bridgeTokenIn',
      'bridgeTokenOut',
      'dstToken',
      BigNumber.from(100),
      BigNumber.from(0),
      BigNumber.from(100),
      BigNumber.from(0),
      new Date(),
      new Date(),
      null,
    );
    stub(repositoryMock, 'getTx').resolves(transaction);
    const swapOrder = new SwapOrder(1, '0xtokenIn', '0xtokenOut', '0xdata', '1234', true);
    const stubQuoting = stub(repositoryMock, 'quoteSwap').resolves(swapOrder);
    const consumer = new TransactionConsumer(routerCaller, repositoryMock, loggerMock);
    const message = getMessage();

    // Act
    await consumer.process(message);

    // Assert
    expect(stubQuoting.calledOnce).toBeTruthy();
    expect(spyRouterCall).toHaveBeenCalledWith({
      rpcNode: undefined,
      routerAddress: 'r',
      receiverAddress: '0x321',
      txHash: '0x123',
      swap: {
        providerCode: 1,
        amountIn: '100',
        tokenIn: '0xtokenIn',
        tokenOut: '0xtokenOut',
        estimatedGas: '5000001234',
        data: '0xdata',
        required: true,
      },
    });
  });
});

function getTransactionRepositoryMock() {
  const configService = createMock<ConfigService>();
  const httpClient = createMock<HttpClient>();
  return new TransactionsRepositoryImpl(configService, httpClient);
}

function getMessage() {
  return createMessage('0x123', [
    { key: 'txHash', value: '0x123' },
    { key: 'receiver', value: '0x321' },
    { key: 'fromChain', value: '1' },
    { key: 'toChain', value: '2' },
    { key: 'srcToken', value: 't' },
    { key: 'dstToken', value: 't' },
    { key: 'router', value: 'r' },
    { key: 'minAmount', value: '100' },
  ]);
}
