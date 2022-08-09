import { BigNumber, Contract, ethers } from 'ethers';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { ContractAddress } from '../../shared/types';
import { RpcNode } from '../../shared/RpcNode';
import {
  CreateTransactionPayload,
  TransactionsRepository,
  UpdateTransactionPayload,
} from '../../transactions/domain/TransactionsRepository';
import { CustomLogger } from '../../logger/CustomLogger';
import { Producer } from 'sqs-producer';
import { SQS } from 'aws-sdk';
import { ConfigService } from '../../config/config.service';

interface TxJob {
  txHash: string;
  wallet: string;
  router: string;
  fromChain: string;
  toChain: string;
  dstToken: string;
  srcToken: string;
}

export class EventsListener {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger,
    @Inject(Class.TransactionsRepository)
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  public async execute() {
    const router = await this.transactionsRepository.getRouterAddress();
    if (!router) {
      this.logger.error('No router address');
      throw new Error('No router address');
    }
    Object.values(RpcNode).forEach((rpcUrl) => {
      this.setListener(rpcUrl, router);
    });
  }

  private setListener(rpcUrl: string, routerAddress: ContractAddress) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const abi = [
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
        'uint256 fromChain,' +
        'uint256 toChain,' +
        'uint256 amountIn,' +
        'uint256 amountCross)',
      'event CrossFinalized(bytes32 txHash, uint256 amountOut)',
    ];

    const contract = new Contract(routerAddress, abi, provider);

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
            const routerAddress = event.address;
            const tx = await provider.getTransactionReceipt(txHash);
            const wallet = tx.from;

            // Create initial transaction
            await this.createTransaction(<CreateTransactionPayload>{
              txHash: txHash,
              walletAddress: wallet,
              routerAddress: routerAddress,
              fromChainId: chainId.toString(),
              toChainId: chainId.toString(),
              srcToken: srcToken,
              bridgeTokenIn: '',
              bridgeTokenOut: '',
              dstToken: dstToken,
              amountIn: amountIn.toString(),
            });

            // Update final amount
            await this.updateTransaction(<UpdateTransactionPayload>{
              txHash: txHash,
              amountOut: amountOut.toString(),
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
          fromChain: BigNumber,
          toChain: BigNumber,
          amountIn: BigNumber,
          amountCross: BigNumber,
          event,
        ) => {
          try {
            this.logger.log('Received CrossInitiated event');
            const txHash = event.transactionHash;
            const routerAddress = event.address;
            const tx = await provider.getTransactionReceipt(txHash);
            const wallet = tx.from;

            // Create initial transaction
            await this.createTransaction(<CreateTransactionPayload>{
              txHash: txHash,
              walletAddress: wallet,
              routerAddress: routerAddress,
              fromChainId: fromChain.toString(),
              toChainId: toChain.toString(),
              srcToken: srcToken,
              bridgeTokenIn: bridgeTokenIn,
              bridgeTokenOut: bridgeTokenOut,
              dstToken: dstToken,
              amountIn: amountIn.toString(),
            });

            // Update bridged amount
            await this.updateTransaction(<UpdateTransactionPayload>{
              txHash: txHash,
              bridgeAmountIn: amountCross.toString(),
            });

            await this.queueJob(<TxJob>{
              txHash: txHash,
              wallet: wallet,
              router: routerAddress,
              fromChain: fromChain.toString(),
              toChain: toChain.toString(),
              srcToken: bridgeTokenOut,
              dstToken: dstToken,
            });
          } catch (e) {
            this.logger.error('Error on CrossInitiated', e);
          }
        },
      )
      .on(
        'CrossFinalized',
        async (txHash: string, amountOut: BigNumber, event) => {
          try {
            this.logger.log('Received CrossFinalized event');
            const destinationTxHash = event.transactionHash;
            await this.updateTransaction(<UpdateTransactionPayload>{
              txHash: txHash,
              destinationTxHash: destinationTxHash,
              amountOut: amountOut.toString(),
              completed: new Date(),
            });
          } catch (e) {
            this.logger.error('Error on CrossFinalized', e);
          }
        },
      );
  }

  private async queueJob(tx: TxJob): Promise<void> {
    const producer = Producer.create({
      queueUrl: this.configService.sqsQueueUrl,
      sqs: new SQS({
        region: this.configService.region,
        accessKeyId: this.configService.accessKey,
        secretAccessKey: this.configService.secret,
      }),
    });

    await producer.send({
      id: tx.txHash,
      body: tx.txHash,
      groupId: tx.wallet,
      deduplicationId: tx.wallet,
      messageAttributes: {
        txHash: { DataType: 'String', StringValue: tx.txHash },
        wallet: { DataType: 'String', StringValue: tx.wallet },
        fromChain: { DataType: 'String', StringValue: tx.fromChain },
        toChain: { DataType: 'String', StringValue: tx.toChain },
        srcToken: { DataType: 'String', StringValue: tx.srcToken },
        dstToken: { DataType: 'String', StringValue: tx.dstToken },
        router: { DataType: 'String', StringValue: tx.router },
      },
    });
  }

  private createTransaction(payload: CreateTransactionPayload): Promise<void> {
    this.logger.log('Create transaction', payload);
    return this.transactionsRepository.create(payload);
  }

  private updateTransaction(payload: UpdateTransactionPayload): Promise<void> {
    this.logger.log('Update transaction', payload);
    return this.transactionsRepository.update(payload);
  }
}
