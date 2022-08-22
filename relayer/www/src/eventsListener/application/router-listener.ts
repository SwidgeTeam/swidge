import { BigNumber, Contract, ethers } from 'ethers';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { ContractAddress } from '../../shared/types';
import { RpcNode } from '../../shared/RpcNode';
import { ConfigService } from '../../config/config.service';
import { Events } from '../../eventsConsumer/domain/event-types';
import { Producer } from 'sqs-producer';
import { SQS } from 'aws-sdk';
import { AddressesRepository } from '../../persistence/domain/addresses-repository';
import { Logger } from '../../shared/domain/logger';

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
    @Inject(Class.Logger) private readonly logger: Logger,
    @Inject(Class.AddressesRepository) private readonly repository: AddressesRepository,
  ) {
    this.producer = this.createSqsProducer();
  }

  /**
   * Entrypoint
   */
  public async start() {
    const router = await this.repository.getRouterAddress();
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

            const body = {
              txHash: txHash,
              routerAddress: routerAddress,
              wallet: wallet,
              chainId: chainId.toString(),
              srcToken: srcToken,
              dstToken: dstToken,
              amountIn: amountIn.toString(),
              amountOut: amountOut.toString(),
            };

            await this.producer.send({
              id: txHash,
              body: JSON.stringify(body),
              groupId: wallet,
              deduplicationId: txHash,
              messageAttributes: {
                event: { DataType: 'String', StringValue: Events.SwapExecuted },
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

            const body = {
              txHash: txHash,
              routerAddress: routerAddress,
              wallet: wallet,
              receiver: receiver,
              fromChain: fromChain.toString(),
              toChain: toChain.toString(),
              srcToken: srcToken,
              bridgeTokenIn: bridgeTokenIn,
              bridgeTokenOut: bridgeTokenOut,
              dstToken: dstToken,
              amountIn: amountIn.toString(),
              amountCross: amountCross.toString(),
              minAmountOut: minAmountOut.toString(),
            };

            await this.producer.send({
              id: txHash,
              body: JSON.stringify(body),
              groupId: wallet,
              deduplicationId: txHash,
              messageAttributes: {
                event: { DataType: 'String', StringValue: Events.CrossInitiated },
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

            const body = {
              txHash: txHash,
              destinationTxHash: destinationTxHash,
              amountOut: amountOut.toString(),
            };

            await this.producer.send({
              id: txHash,
              body: JSON.stringify(body),
              groupId: wallet,
              deduplicationId: txHash,
              messageAttributes: {
                event: { DataType: 'String', StringValue: Events.CrossFinalized },
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
