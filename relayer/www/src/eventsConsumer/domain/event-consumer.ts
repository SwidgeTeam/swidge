import { SQSMessage } from 'sqs-consumer';
import EventProcessor from './event-processor';
import { Events } from './event-types';

export default class EventConsumer {
  private processor: EventProcessor;

  constructor(processor: EventProcessor) {
    this.processor = processor;
  }

  public async process(message: SQSMessage) {
    const event = message.MessageAttributes.event.StringValue;
    const body = JSON.parse(message.Body);
    switch (event) {
      case Events.SwapExecuted:
        await this.processor.swapExecuted({
          txHash: body.txHash,
          routerAddress: body.routerAddress,
          wallet: body.wallet,
          chainId: body.chainId,
          srcToken: body.srcToken,
          dstToken: body.dstToken,
          amountIn: body.amountIn,
          amountOut: body.amountOut,
        });
        break;
      case Events.CrossInitiated:
        await this.processor.crossInitiated({
          txHash: body.txHash,
          routerAddress: body.routerAddress,
          wallet: body.wallet,
          receiver: body.receiver,
          fromChain: body.fromChain,
          toChain: body.toChain,
          srcToken: body.srcToken,
          bridgeTokenIn: body.bridgeTokenIn,
          bridgeTokenOut: body.bridgeTokenOut,
          dstToken: body.dstToken,
          amountIn: body.amountIn,
          amountCross: body.amountCross,
          minAmountOut: body.minAmountOut,
        });
        break;
      case Events.CrossFinalized:
        await this.processor.crossFinalized({
          txHash: body.txHash,
          destinationTxHash: body.destinationTxHash,
          amountOut: body.amountOut,
          completed: new Date(),
        });
        break;
      case Events.MultichainDelivered:
        await this.processor.multichainDelivered({
          originTxHash: body.txHash,
          amountOut: body.amountOut,
          bridged: new Date(),
        });
        break;
    }
  }
}
