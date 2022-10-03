import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { GetWalletBalancesDto } from './get-wallet-balances-dto';
import { GetWalletTokenListQuery } from '../../application/query/get-wallet-token-list-query';
import { WalletBalances } from '../../domain/wallet-balances';
import { NATIVE_TOKEN_ADDRESS } from '../../../shared/enums/Natives';
import { BigNumber } from 'ethers';

@Controller()
export class GetWalletBalancesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('token-balances')
  async get(@Query() params: GetWalletBalancesDto, @Res() res: Response) {
    const query = new GetWalletTokenListQuery(params.wallet);
    const balances = await this.queryBus.execute<GetWalletTokenListQuery, WalletBalances>(query);

    return res.json({
      empty: false,
      tokens: [
        {
          chainId: '1',
          address: NATIVE_TOKEN_ADDRESS,
          amount: BigNumber.from('1321319191919191').toString(),
        },
        {
          chainId: '137',
          address: NATIVE_TOKEN_ADDRESS,
          amount: BigNumber.from('123123128838282828282').toString(),
        },
      ],
    });
  }
}
