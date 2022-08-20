import { BigNumber, Contract, ethers } from 'ethers';
import { Inject } from '@nestjs/common';
import { Class } from '../../shared/Class';
import { ContractAddress } from '../../shared/types';
import { RpcNode } from '../../shared/RpcNode';
import {
  TransactionsRepository,
} from '../../transactions/domain/TransactionsRepository';
import { CustomLogger } from '../../logger/CustomLogger';
import { ConfigService } from '../../config/config.service';
import EventProcessor from '../domain/event-processor';
import { abiEvents } from '../domain/event-types';

export class EventsListener {
  private eventProcessor: EventProcessor;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger,
    @Inject(Class.TransactionsRepository)
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    this.eventProcessor = new EventProcessor(
      configService,
      logger,
      transactionsRepository,
    );
  }

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
    const contract = new Contract(routerAddress, abiEvents, provider);
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

            await this.eventProcessor.swapExecuted({
              txHash: txHash,
              routerAddress: event.address,
              wallet: tx.from,
              chainId: chainId.toString(),
              srcToken: srcToken,
              dstToken: dstToken,
              amountIn: amountIn.toString(),
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

            await this.eventProcessor.crossInitiated({
              txHash: txHash,
              routerAddress: event.address,
              wallet: tx.from,
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
            });
          } catch (e) {
            this.logger.error('Error on CrossInitiated', e);
          }
        },
      )
      .on(
        'CrossFinalized',
        async (
          txHash: string,
          amountOut: BigNumber,
          tokenOut: string,
          event,
        ) => {
          try {
            this.logger.log('Received CrossFinalized event');

            await this.eventProcessor.crossFinalized({
              txHash: txHash,
              destinationTxHash: event.transactionHash,
              amountOut: amountOut.toString(),
              completed: new Date(),
            });
          } catch (e) {
            this.logger.error('Error on CrossFinalized', e);
          }
        },
      );
  }
}
