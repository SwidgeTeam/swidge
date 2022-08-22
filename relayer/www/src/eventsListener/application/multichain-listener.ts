import { ethers } from 'ethers';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { ContractAddress } from '../../shared/types';
import { RpcNode } from '../../shared/RpcNode';
import { ConfigService } from '../../config/config.service';
import { hexZeroPad } from 'ethers/lib/utils';
import { Producer } from 'sqs-producer';
import { SQS } from 'aws-sdk';
import { Events } from '../../eventsConsumer/domain/event-types';
import { AddressesRepository } from '../../persistence/domain/addresses-repository';
import { Logger } from '../../shared/domain/logger';

export class MultichainListener {
  private producer: Producer;
  private routerAddress: ContractAddress;

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
    this.routerAddress = await this.repository.getRouterAddress();
    const multichainRouters = await this.repository.getMultichainRouters();

    if (!this.routerAddress) {
      this.logger.error('No router address');
      throw new Error('No router address');
    }

    multichainRouters.forEach((contract) => {
      const rpcUrl = RpcNode[contract.chainId];
      if (rpcUrl) {
        this.setListener(rpcUrl, contract.address);
      }
    });
  }

  /**
   * Sets up listeners for different Multichain contracts
   * @param rpcUrl RPC URL for the chain's node
   * @param contractAddress Contract address to listen to
   * @private
   */
  private setListener(rpcUrl: string, contractAddress: ContractAddress) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    this.logger.log('listening ' + contractAddress + ' through ' + rpcUrl);

    /**
     * event LogAnySwapIn(
     *   bytes32 indexed txhash,
     *   address indexed token,
     *   address indexed to,
     *   uint256 amount,
     *   uint256 fromChainID,
     *   uint256 toChainID,
     * )
     */

    const filter = {
      address: contractAddress,
      topics: [
        ethers.utils.id('LogAnySwapIn(bytes32,address,address,uint256,uint256,uint256)'),
        null,
        null,
        hexZeroPad(this.routerAddress, 32),
      ],
    };

    provider.on(filter, async (event) => {
      const [amount] = ethers.utils.defaultAbiCoder.decode(['uint256'], event.data);
      const originTxHash = event.topics[1];
      const txHash = event.transactionHash;

      const body = {
        originTxHash: originTxHash,
        amountOut: amount.toString(),
      };

      try {
        await this.producer.send({
          id: txHash,
          body: JSON.stringify(body),
          groupId: 'multichain',
          deduplicationId: txHash,
          messageAttributes: {
            event: { DataType: 'String', StringValue: Events.MultichainDelivered },
          },
        });
      } catch (error) {
        this.logger.error('Error updating tx', error);
      }
    });
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
