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
import { CachedGasPriceFetcher } from '../../../shared/domain/cached-gas-price-fetcher';
import { LiFi } from '../../domain/providers/liFi';

@CommandHandler(ExecutedTxCommand)
export class ExecutedTxHandler implements ICommandHandler<ExecutedTxCommand> {
  private aggregators: Map<string, ExternalAggregator>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.PriceFeedFetcher) private readonly priceFeedFetcher: CachedPriceFeedFetcher,
    @Inject(Class.GasPriceFetcher) private readonly gasPriceFetcher: CachedGasPriceFetcher,
  ) {
    this.aggregators = new Map<string, ExternalAggregator>([
      [AggregatorProviders.LiFi, LiFi.create()],
      [
        AggregatorProviders.Via,
        ViaExchange.create(configService.getViaApiKey(), gasPriceFetcher, priceFeedFetcher),
      ],
      [AggregatorProviders.Rango, Rango.create(configService.getRangoApiKey())],
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
