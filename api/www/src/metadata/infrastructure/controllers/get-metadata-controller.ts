import { Controller, Get, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import GetMetadataQuery from '../../application/query/get-metadata-query';
import Metadata from '../../domain/Metadata';

@Controller()
export class GetMetadataController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('meta')
  async build(@Res() res: Response) {
    const query = new GetMetadataQuery();

    const meta = await this.queryBus.execute<GetMetadataQuery, Metadata>(query);

    return res.json({
      chains: meta.chains.map((chain) => {
        return {
          type: chain.type,
          id: chain.id,
          name: chain.name,
          logo: chain.logo,
          coin: chain.coin,
          decimals: chain.decimals,
          rpcUrls: chain.rpcUrls,
        };
      }),
      tokens: meta.tokens.map((token) => {
        return {
          chainId: token.chainId,
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          logo: token.logo,
          price: token.price,
        };
      }),
    });
  }
}
