import { Controller, Get, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetTokenListQuery } from '../../application/query/get-token-list-query';
import { Response } from 'express';
import { TokenList } from '../../domain/TokenItem';
import { TokenListItem } from '../../domain/TokenListItem';

@Controller()
export class GetTokenListController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('token-list')
  async getTokenList(@Res() res: Response) {
    const tokenList = await this.queryBus.execute<GetTokenListQuery, TokenList>(
      new GetTokenListQuery(),
    );

    return res.json({
      list: tokenList.map(this.printToken),
    });
  }

  private printToken(item: TokenListItem) {
    return {
      c: item.chainId,
      a: item.address,
      n: item.name,
      s: item.symbol,
      d: item.decimals,
      l: item.logoURL,
    };
  }
}
