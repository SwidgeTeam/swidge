import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { GetWalletBalancesDto } from './get-wallet-balances-dto';
import { GetWalletTokenListQuery } from '../../application/query/get-wallet-token-list-query';
import { WalletBalances } from '../../domain/wallet-balances';

@Controller()
export class GetWalletBalancesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('token-balances')
  async get(@Query() params: GetWalletBalancesDto, @Res() res: Response) {
    const query = new GetWalletTokenListQuery(params.wallet);
    const balances = await this.queryBus.execute<GetWalletTokenListQuery, WalletBalances>(query);

    return res.json({
      empty: balances.tokens.length === 0,
      tokens: balances.tokens.map((token) => {
        return {
          chainId: token.chainId,
          address: token.address,
          amount: token.hex_amount,
        };
      }),
    });
  }
}
