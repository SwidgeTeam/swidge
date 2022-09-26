import { Controller, Get, Param, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import GetMetadataQuery from '../../application/query/get-metadata-query';
import Metadata from '../../domain/Metadata';

@Controller()
export class GetMetadataController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('meta/:reload?')
  async build(@Param() params: { reload: string }, @Res() res: Response) {
    const query = new GetMetadataQuery(params.reload === 'true');

    const meta = await this.queryBus.execute<GetMetadataQuery, Metadata>(query);

    const chains = meta.chains.map((chain) => {
      return {
        t: chain.type,
        i: chain.id,
        n: chain.name,
        l: chain.logo,
        m: {
          c: chain.metamask.chainName,
          r: chain.metamask.rpcUrls,
          n: {
            n: chain.metamask.nativeCurrency.name,
            s: chain.metamask.nativeCurrency.symbol,
            d: chain.metamask.nativeCurrency.decimals,
          },
        },
      };
    });

    const tokens = {};
    for (const [chainId, tokensList] of Object.entries(meta.tokens)) {
      tokens[chainId] = tokensList.map((token) => {
        return {
          c: token.chainId,
          a: token.address,
          n: token.name,
          s: token.symbol,
          d: token.decimals,
          l: token.logo,
          p: token.price,
        };
      });
    }

    return res.json({
      chains: chains,
      tokens: tokens,
    });
  }
}
