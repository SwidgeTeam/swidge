import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
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
import { TransactionsRepository } from '../../domain/TransactionsRepository';
import { Logger } from '../../../shared/domain/logger';
import { Transaction } from '../../domain/Transaction';
import { BigInteger } from '../../../shared/domain/big-integer';
import { TransactionStep } from '../../domain/TransactionStep';

@CommandHandler(ExecutedTxCommand)
export class ExecutedTxHandler implements ICommandHandler<ExecutedTxCommand> {
  private aggregators: Map<string, ExternalAggregator>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.TransactionRepository) private readonly repository: TransactionsRepository,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
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
        command.fromAddress,
        command.toAddress,
        command.fromChain,
        command.toChain,
        command.fromToken,
        status.toToken,
        ExternalTransactionStatus.Success,
      );

      const step = new TransactionStep(
        command.txHash,
        status.dstTxHash,
        command.fromChain,
        command.toChain,
        command.fromToken,
        status.toToken,
        status.amountIn,
        status.amountOut,
        new Date(),
        new Date(),
        ExternalTransactionStatus.Success,
        command.aggregatorId,
        command.trackingId,
      );

      tx.addStep(step);

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

      const tx = Transaction.create(
        command.fromAddress,
        command.toAddress,
        command.fromChain,
        command.toChain,
        command.fromToken,
        '',
        ExternalTransactionStatus.Pending,
      );

      const step = new TransactionStep(
        command.txHash,
        '',
        command.fromChain,
        command.toChain,
        command.fromToken,
        '',
        BigInteger.fromString(command.amountIn),
        BigInteger.zero(),
        new Date(),
        null,
        ExternalTransactionStatus.Pending,
        command.aggregatorId,
        command.trackingId,
      );

      tx.addStep(step);

      await this.repository.create(tx);
    } catch (e) {
      this.logger.error(`cross chain tx ${command.txHash} processing failed: ${e}`);
      // this needs to succeed
      await this.processCrossChainTx(command);
    }
  }

  /**
   * fetches te status of a tx from the provider
   * @private
   * @param command
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
