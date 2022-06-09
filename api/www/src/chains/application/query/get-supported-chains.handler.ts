import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSupportedChainsQuery } from './get-supported-chains.query';
import { ChainRepository } from '../../domain/chain.repository';
import { Class } from '../../../shared/Class';

@QueryHandler(GetSupportedChainsQuery)
export class GetSupportedChainsHandler
  implements IQueryHandler<GetSupportedChainsQuery>
{
  constructor(
    @Inject(Class.ChainsRepository) private readonly repository: ChainRepository,
  ) {}

  execute(query: GetSupportedChainsQuery): Promise<any> {
    return this.repository.getSupported();
  }
}
