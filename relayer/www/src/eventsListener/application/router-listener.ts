import { BigNumber, Contract, ethers } from 'ethers';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { ContractAddress } from '../../shared/types';
import { RpcNode } from '../../shared/RpcNode';
import { TransactionsRepository } from '../../transactions/domain/TransactionsRepository';
import { CustomLogger } from '../../logger/CustomLogger';
import { ConfigService } from '../../config/config.service';
import { Events } from '../../eventsConsumer/domain/event-types';
import { Producer } from 'sqs-producer';
import { SQS } from 'aws-sdk';

export class RouterListener {
  private producer: Producer;
  private abiEvents = [
    'event SwapExecuted(' +
      'address srcToken,' +
      'address dstToken,' +
      'uint256 chainId,' +
      'uint256 amountIn,' +
      'uint256 amountOut)',
    'event CrossInitiated(' +
      'address srcToken,' +
      'address bridgeTokenIn,' +
      'address bridgeTokenOut,' +
      'address dstToken,' +
      'address receiver,' +
      'uint256 fromChain,' +
      'uint256 toChain,' +
      'uint256 amountIn,' +
      'uint256 amountCross,' +
      'uint256 minAmountOut)',
    'event CrossFinalized(' + 'bytes32 txHash,' + 'uint256 amountOut,' + 'address assetOut)',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger,
    @Inject(Class.TransactionsRepository)
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    this.producer = this.createSqsProducer();
  }

  /**
   * Entrypoint
   */
  public async start() {
    const router = await this.transactionsRepository.getRouterAddress();
    if (!router) {
      this.logger.error('No router address');
      throw new Error('No router address');
    }
    Object.values(RpcNode).forEach((rpcUrl) => {
      this.setListener(rpcUrl, router);
    });
  }

  /**
   * Sets listener for each chain
   * @param rpcUrl
   * @param routerAddress
   * @private
   */
  private setListener(rpcUrl: string, routerAddress: ContractAddress) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new Contract(routerAddress, this.abiEvents, provider);
    this.logger.log('listening ' + routerAddress + ' through ' + rpcUrl);

    contract
      .on(
        'SwapExecuted',
        async (
          srcToken: string,
          dstToken: string,
          chainId: BigNumber,
          amountIn: BigNumber,
          amountOut: BigNumber,
          event,
        ) => {
          try {
            this.logger.log('Received SwapExecuted event');

            const txHash = event.transactionHash;
            const tx = await provider.getTransactionReceipt(txHash);
            const wallet = tx.from;
            const routerAddress = event.address;

            await this.producer.send({
              id: txHash,
              body: Events.SwapExecuted,
              groupId: wallet,
              deduplicationId: txHash,
              messageAttributes: {
                txHash: { DataType: 'String', StringValue: txHash },
                routerAddress: { DataType: 'String', StringValue: routerAddress },
                wallet: { DataType: 'String', StringValue: wallet },
                chainId: { DataType: 'String', StringValue: chainId.toString() },
                srcToken: { DataType: 'String', StringValue: srcToken },
                dstToken: { DataType: 'String', StringValue: dstToken },
                amountIn: { DataType: 'String', StringValue: amountIn.toString() },
                amountOut: { DataType: 'String', StringValue: amountOut.toString() },
              },
            });
          } catch (e) {
            this.logger.error('Error on SwapExecuted', e);
          }
        },
      )
      .on(
        'CrossInitiated',
        async (
          srcToken: string,
          bridgeTokenIn: string,
          bridgeTokenOut: string,
          dstToken: string,
          receiver: string,
          fromChain: BigNumber,
          toChain: BigNumber,
          amountIn: BigNumber,
          amountCross: BigNumber,
          minAmountOut: BigNumber,
          event,
        ) => {
          try {
            this.logger.log('Received CrossInitiated event');
            const txHash = event.transactionHash;
            const tx = await provider.getTransactionReceipt(txHash);
            const wallet = tx.from;
            const routerAddress = event.address;

            await this.producer.send({
              id: txHash,
              body: Events.CrossInitiated,
              groupId: wallet,
              deduplicationId: txHash,
              messageAttributes: {
                txHash: { DataType: 'String', StringValue: txHash },
                routerAddress: { DataType: 'String', StringValue: routerAddress },
                wallet: { DataType: 'String', StringValue: wallet },
                receiver: { DataType: 'String', StringValue: receiver },
                fromChain: { DataType: 'String', StringValue: fromChain.toString() },
                toChain: { DataType: 'String', StringValue: toChain.toString() },
                srcToken: { DataType: 'String', StringValue: srcToken },
                bridgeTokenIn: { DataType: 'String', StringValue: bridgeTokenIn },
                bridgeTokenOut: { DataType: 'String', StringValue: bridgeTokenOut },
                dstToken: { DataType: 'String', StringValue: dstToken },
                amountIn: { DataType: 'String', StringValue: amountIn.toString() },
                amountCross: { DataType: 'String', StringValue: amountCross.toString() },
                minAmountOut: { DataType: 'String', StringValue: minAmountOut.toString() },
              },
            });
          } catch (e) {
            this.logger.error('Error on CrossInitiated', e);
          }
        },
      )
      .on(
        'CrossFinalized',
        async (txHash: string, amountOut: BigNumber, tokenOut: string, event) => {
          try {
            this.logger.log('Received CrossFinalized event');
            const destinationTxHash = event.transactionHash;
            const tx = await provider.getTransactionReceipt(txHash);
            const wallet = tx.from;

            await this.producer.send({
              id: txHash,
              body: Events.CrossFinalized,
              groupId: wallet,
              deduplicationId: txHash,
              messageAttributes: {
                txHash: { DataType: 'String', StringValue: txHash },
                destinationTxHash: { DataType: 'String', StringValue: destinationTxHash },
                amountOut: { DataType: 'String', StringValue: amountOut.toString() },
              },
            });
          } catch (e) {
            this.logger.error('Error on CrossFinalized', e);
          }
        },
      );
  }

  /**
   * Creates the producer for `events queue`
   * @private
   */
  private createSqsProducer(): Producer {
    return Producer.create({
      queueUrl: this.configService.sqsEventsQueueUrl,
      sqs: new SQS({
        region: this.configService.region,
        accessKeyId: this.configService.accessKey,
        secretAccessKey: this.configService.secret,
      }),
    });
  }
}
