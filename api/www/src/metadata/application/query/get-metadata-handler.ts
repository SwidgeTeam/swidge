import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { Logger } from '../../../shared/domain/logger';
import { MetadataProviderAggregator } from 'src/aggregators/domain/aggregator';
import GetMetadataQuery from './get-metadata-query';
import { AggregatorProviders } from '../../../aggregators/domain/providers/aggregator-providers';
import { LiFi } from '../../../aggregators/domain/providers/liFi';
import Metadata from '../../domain/Metadata';
import { Rango } from '../../../aggregators/domain/providers/rango';
import { ConfigService } from '../../../config/config.service';

@QueryHandler(GetMetadataQuery)
export class GetMetadataHandler implements IQueryHandler<GetMetadataQuery> {
  private aggregators: Map<string, MetadataProviderAggregator>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Class.Logger) private readonly logger: Logger,
  ) {
    this.aggregators = new Map<string, MetadataProviderAggregator>([
      [AggregatorProviders.LiFi, LiFi.create(logger)],
      [AggregatorProviders.Rango, Rango.create(configService.getRangoApiKey(), logger)],
    ]);
  }

  async execute(): Promise<Metadata> {
    this.logger.log('Fetching metadata...');
    const metadata = new Metadata();
    for (const aggregator of this.aggregators.values()) {
      const meta = await aggregator.getMetadata();
      metadata.includeAggregatorMetadata(meta);
    }
    return metadata;
  }
}
