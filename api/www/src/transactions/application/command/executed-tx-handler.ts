import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '../../../config/config.service';
import { ExecutedTxCommand } from './executed-tx-command';
import { ExternalAggregator } from '../../../aggregators/domain/aggregator';
import { AggregatorProviders } from '../../../aggregators/domain/providers/aggregator-providers';
import { Rango } from '../../../aggregators/domain/providers/rango';
import { LiFi } from '../../../aggregators/domain/providers/liFi';
import {
  ExternalTransactionStatus,
  StatusCheckResponse,
} from '../../../aggregators/domain/status-check';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { TransactionsRepository } from '../../domain/TransactionsRepository';
import { Logger } from '../../../shared/domain/logger';
import { Transaction } from '../../domain/Transaction';
import { BigInteger } from '../../../shared/domain/big-integer';

@CommandHandler(ExecutedTxCommand)
export class ExecutedTxHandler implements ICommandHandler<ExecutedTxCommand> {
  private aggregators: Map<string, ExternalAggregator>;
  private intervals: Map<string, ReturnType<typeof setInterval>>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.TransactionRepository) private readonly repository: TransactionsRepository,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.intervals = new Map<string, ReturnType<typeof setInterval>>();
    this.aggregators = new Map<string, ExternalAggregator>([
      [AggregatorProviders.LiFi, LiFi.create(logger)],
      [AggregatorProviders.Rango, Rango.create(configService.getRangoApiKey(), logger)],
    ]);
  }

  /**
   * Entrypoint
   * @param command
   */
  async execute(command: ExecutedTxCommand): Promise<void> {
    this.logger.log(`Executed txHash ${command.txHash}`);

    // informs tx has started
    await this.aggregators
      .get(command.aggregatorId)
      .executedTransaction(
        command.txHash,
        command.trackingId,
        command.fromAddress,
        command.toAddress,
      );

    // process a tx into the system
    if (command.fromChain === command.toChain) {
      // set a small timeout to make sure the provider system has indexed data
      setTimeout(() => {
        this.processSingleChainTx(command);
      }, 5000);
    } else {
      await this.processCrossChainTx(command);
    }
  }

  /**
   * steps for a single chain transactin
   * @param command
   * @private
   */
  private async processSingleChainTx(command: ExecutedTxCommand) {
    try {
      this.logger.log(`Processing single chain tx ${command.txHash}...`);

      const status = await this.checkTxStatus(command);

      const tx = Transaction.create(
        command.txHash,
        command.fromAddress,
        command.toAddress,
        command.fromChain,
        command.toChain,
        status.fromToken,
        status.toToken,
        status.amountIn,
        status.amountOut,
        ExternalTransactionStatus.Success,
        command.aggregatorId,
        command.trackingId,
      );
      await this.repository.create(tx);
    } catch (e) {
      this.logger.error(`Single chain tx ${command.txHash} processing failed: ${e}`);
      // retry, we need to leave that done
      await this.processSingleChainTx(command);
    }
  }

  /**
   * steps for a cross chain transaction
   * @param command
   * @private
   */
  private async processCrossChainTx(command: ExecutedTxCommand) {
    try {
      this.logger.log(`Processing cross chain tx ${command.txHash}...`);

      const status = await this.checkTxStatus(command);

      const tx = Transaction.create(
        command.txHash,
        command.fromAddress,
        command.toAddress,
        command.fromChain,
        command.toChain,
        status.fromToken,
        '',
        status.amountIn,
        BigInteger.zero(),
        ExternalTransactionStatus.Pending,
        command.aggregatorId,
        command.trackingId,
      );
      await this.repository.create(tx);
    } catch (e) {
      this.logger.error(`cross chain tx ${command.txHash} processing failed: ${e}`);
      // this needs to succeed
      await this.processCrossChainTx(command);
      return;
    }

    // sets interval to keep checking until resolved
    const interval = setInterval(() => {
      this.recheckTx(command);
    }, 5000);

    this.intervals.set(command.txHash, interval);
  }

  /**
   * This method will be called until the transaction reaches a state of resolution
   * @param command
   * @private
   */
  private async recheckTx(command: ExecutedTxCommand) {
    try {
      this.logger.log(`Rechecking tx ${command.txHash}...`);

      const status = await this.checkTxStatus(command);

      if (status.status !== ExternalTransactionStatus.Pending) {
        const tx = await this.repository.find(command.txHash);
        this.logger.log(`tx ${command.txHash} found`);

        tx.markAsCompleted(new Date())
          .setDestinationToken(status.toToken)
          .setAmountOut(status.amountOut)
          .setDestinationTxHash(status.dstTxHash)
          .setStatus(status.status);
        await this.repository.update(tx);

        this.removeInterval(command.txHash);
        this.logger.log(`tx ${command.txHash} finished w/ status ${status.status}`);
      } else {
        this.logger.log(`${command.txHash} still pending`);
      }
    } catch (e) {
      this.logger.error(`Rechecking tx ${command.txHash} failed: ${e}`);
    }
  }

  /**
   * removes the set interval
   * @param txHash
   * @private
   */
  private removeInterval(txHash: string): void {
    clearInterval(this.intervals.get(txHash));
    this.intervals.delete(txHash);
  }

  /**
   * fetches te status of a tx from the provider
   * @param command
   * @private
   */
  private async checkTxStatus(command: ExecutedTxCommand): Promise<StatusCheckResponse> {
    return this.aggregators.get(command.aggregatorId).checkStatus({
      fromChain: command.fromChain,
      toChain: command.toChain,
      txHash: command.txHash,
      trackingId: command.trackingId,
    });
  }
}
