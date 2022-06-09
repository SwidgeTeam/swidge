import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetSupportedChainsQuery } from '../../application/query/get-supported-chains.query';

@Controller()
export class GetSupportedChainsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('chains')
  async getSupportedChains() {
    return await this.queryBus.execute(new GetSupportedChainsQuery());
  }
}
