import { SQSMessage } from 'sqs-consumer';
import EventProcessor from './event-processor';
import { CustomLogger } from '../../logger/CustomLogger';
import { Producer } from 'sqs-producer';
import { Events } from './event-types';
import { TransactionsRepository } from '../../persistence/domain/transactions-repository';

export default class EventConsumer {
  private processor: EventProcessor;

  constructor(
    private readonly producer: Producer,
    private readonly repository: TransactionsRepository,
    private readonly logger: CustomLogger,
  ) {
    this.processor = new EventProcessor(producer, repository, logger);
  }

  public async process(event: SQSMessage) {
    const attr = event.MessageAttributes;
    switch (event.Body) {
      case Events.SwapExecuted:
        await this.processor.swapExecuted({
          txHash: attr.txHash.StringValue,
          routerAddress: attr.routerAddress.StringValue,
          wallet: attr.wallet.StringValue,
          chainId: attr.chainId.StringValue,
          srcToken: attr.srcToken.StringValue,
          dstToken: attr.dstToken.StringValue,
          amountIn: attr.amountIn.StringValue,
          amountOut: attr.amountOut.StringValue,
        });
        break;
      case Events.CrossInitiated:
        await this.processor.crossInitiated({
          txHash: attr.txHash.StringValue,
          routerAddress: attr.routerAddress.StringValue,
          wallet: attr.wallet.StringValue,
          receiver: attr.receiver.StringValue,
          fromChain: attr.fromChain.StringValue,
          toChain: attr.toChain.StringValue,
          srcToken: attr.srcToken.StringValue,
          bridgeTokenIn: attr.bridgeTokenIn.StringValue,
          bridgeTokenOut: attr.bridgeTokenOut.StringValue,
          dstToken: attr.dstToken.StringValue,
          amountIn: attr.amountIn.StringValue,
          amountCross: attr.amountCross.StringValue,
          minAmountOut: attr.minAmountOut.StringValue,
        });
        break;
      case Events.CrossFinalized:
        await this.processor.crossFinalized({
          txHash: attr.txHash.StringValue,
          destinationTxHash: attr.destinationTxHash.StringValue,
          amountOut: attr.amountOut.StringValue,
          completed: new Date(),
        });
        break;
      case Events.MultichainDelivered:
        await this.processor.multichainDelivered({
          originTxHash: attr.txHash.StringValue,
          amountOut: attr.amountOut.StringValue,
        });
        break;
    }
  }
}
