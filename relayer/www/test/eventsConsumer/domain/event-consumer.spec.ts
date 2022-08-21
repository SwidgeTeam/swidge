import { createMock } from 'ts-auto-mock';
import EventProcessor from '../../../src/eventsConsumer/domain/event-processor';
import EventConsumer from '../../../src/eventsConsumer/domain/event-consumer';
import { method, On } from 'ts-auto-mock/extension';
import { createMessage } from '../../shared';

describe('event-consumer', () => {
  it('should call right function on SwapExecuted event', () => {
    // Arrange
    const processor = createMock<EventProcessor>();
    const consumer = new EventConsumer(processor);
    const spy = On(processor).get(method('swapExecuted'));
    const message = createMessage('swap_executed', [
      { key: 'txHash', value: '0x123' },
      { key: 'routerAddress', value: '0x212' },
      { key: 'wallet', value: '0xx' },
      { key: 'chainId', value: '1' },
      { key: 'srcToken', value: '12' },
      { key: 'dstToken', value: '21' },
      { key: 'amountIn', value: '222' },
      { key: 'amountOut', value: '333' },
    ]);

    // Act
    consumer.process(message);

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      txHash: '0x123',
      routerAddress: '0x212',
      wallet: '0xx',
      chainId: '1',
      srcToken: '12',
      dstToken: '21',
      amountIn: '222',
      amountOut: '333',
    });
  });

  it('should call right function on CrossInitiated event', () => {
    // Arrange
    const processor = createMock<EventProcessor>();
    const consumer = new EventConsumer(processor);
    const spy = On(processor).get(method('crossInitiated'));
    const message = createMessage('cross_initiated', [
      { key: 'txHash', value: '0x123' },
      { key: 'routerAddress', value: '0x122' },
      { key: 'wallet', value: '0x3' },
      { key: 'receiver', value: '0x1234' },
      { key: 'fromChain', value: '0x1235' },
      { key: 'toChain', value: '0x1236' },
      { key: 'srcToken', value: '0x1237' },
      { key: 'bridgeTokenIn', value: '0x1238' },
      { key: 'bridgeTokenOut', value: '0x1239' },
      { key: 'dstToken', value: '0x12344' },
      { key: 'amountIn', value: '0x12355' },
      { key: 'amountCross', value: '0x12366' },
      { key: 'minAmountOut', value: '0x12377' },
    ]);

    // Act
    consumer.process(message);

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      txHash: '0x123',
      routerAddress: '0x122',
      wallet: '0x3',
      receiver: '0x1234',
      fromChain: '0x1235',
      toChain: '0x1236',
      srcToken: '0x1237',
      bridgeTokenIn: '0x1238',
      bridgeTokenOut: '0x1239',
      dstToken: '0x12344',
      amountIn: '0x12355',
      amountCross: '0x12366',
      minAmountOut: '0x12377',
    });
  });

  it('should call right function on CrossFinalized event', () => {
    // Arrange
    const processor = createMock<EventProcessor>();
    const consumer = new EventConsumer(processor);
    const spy = On(processor).get(method('crossFinalized'));
    const message = createMessage('cross_finalized', [
      { key: 'txHash', value: '0x123' },
      { key: 'destinationTxHash', value: '0x122' },
      { key: 'amountOut', value: '0x3' },
    ]);

    // Act
    consumer.process(message);

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].txHash).toEqual('0x123');
    expect(spy.mock.calls[0][0].destinationTxHash).toEqual('0x122');
    expect(spy.mock.calls[0][0].amountOut).toEqual('0x3');
  });

  it('should call right function on MultichainDelivered event', () => {
    // Arrange
    const processor = createMock<EventProcessor>();
    const consumer = new EventConsumer(processor);
    const spy = On(processor).get(method('multichainDelivered'));
    const message = createMessage('multichain_delivered', [
      { key: 'txHash', value: '0x123' },
      { key: 'amountOut', value: '0x122' },
    ]);

    // Act
    consumer.process(message);

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].originTxHash).toEqual('0x123');
    expect(spy.mock.calls[0][0].amountOut).toEqual('0x122');
  });
});
