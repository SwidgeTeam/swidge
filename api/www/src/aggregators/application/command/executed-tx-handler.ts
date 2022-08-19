import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '../../../config/config.service';
import { ExecutedTxCommand } from './executed-tx-command';
import { ExternalAggregator } from '../../domain/aggregator';
import { AggregatorProviders } from '../../domain/providers/aggregator-providers';
import { ViaExchange } from '../../domain/providers/via-exchange';
import { Rango } from '../../domain/providers/rango';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { CachedPriceFeedFetcher } from '../../../shared/domain/cached-price-feed-fetcher';

@CommandHandler(ExecutedTxCommand)
export class ExecutedTxHandler implements ICommandHandler<ExecutedTxCommand> {
  private aggregators: Map<string, ExternalAggregator>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.PriceFeedFetcher) private readonly priceFeedFetcher: CachedPriceFeedFetcher,
  ) {
    this.aggregators = new Map<string, ExternalAggregator>([
      [AggregatorProviders.Via, ViaExchange.create(configService.getViaApiKey())],
      [AggregatorProviders.Rango, Rango.create(configService.getRangoApiKey(), priceFeedFetcher)],
    ]);
  }

  async execute(command: ExecutedTxCommand): Promise<void> {
    return this.aggregators
      .get(command.aggregatorId)
      .executedTransaction(
        command.txHash,
        command.trackingId,
        command.fromAddress,
        command.toAddress,
      );
  }
}
