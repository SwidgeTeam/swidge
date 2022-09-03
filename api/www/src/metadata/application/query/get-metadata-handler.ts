import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Class } from '../../../shared/Class';
import { Logger } from '../../../shared/domain/logger';
import { MetadataProviderAggregator } from 'src/aggregators/domain/aggregator';
import GetMetadataQuery from './get-metadata-query';
import { AggregatorProviders } from '../../../aggregators/domain/providers/aggregator-providers';
import { LiFi } from '../../../aggregators/domain/providers/liFi';
import Metadata from '../../domain/Metadata';

@QueryHandler(GetMetadataQuery)
export class GetMetadataHandler implements IQueryHandler<GetMetadataQuery> {
  private aggregators: Map<string, MetadataProviderAggregator>;

  constructor(@Inject(Class.Logger) private readonly logger: Logger) {
    this.aggregators = new Map<string, MetadataProviderAggregator>([
      [AggregatorProviders.LiFi, LiFi.create()],
    ]);
  }

  async execute(): Promise<Metadata> {
    const metadata = new Metadata();
    for (const aggregator of this.aggregators.values()) {
      const meta = await aggregator.getMetadata();
      metadata.includeAggregatorMetadata(meta);
    }
    return metadata;
  }
}
