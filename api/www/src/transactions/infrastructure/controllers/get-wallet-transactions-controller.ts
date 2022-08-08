import { Controller, Get, Param, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { Transaction } from '../../domain/Transaction';
import { GetWalletTransactionsDto } from './get-wallet-transactions-dto';
import { GetWalletTransactionsQuery } from '../../application/query/get-wallet-transactions-query';
import { Transactions } from '../../domain/Transactions';

@Controller()
export class GetWalletTransactionsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/transactions/:wallet')
  async getTransaction(@Param() params: GetWalletTransactionsDto, @Res() res: Response) {
    const query = new GetWalletTransactionsQuery(params.wallet);

    const transactions = await this.queryBus.execute<GetWalletTransactionsQuery, Transactions>(
      query,
    );

    return res.json({
      transactions: transactions.map((tx: Transaction) => {
        return {
          txHash: tx.txHash,
          status: tx.status,
          date: tx.executed,
          fromChain: tx.fromChainId,
          toChain: tx.toChainId,
          srcAsset: tx.srcToken,
          dstAsset: tx.dstToken,
          amountIn: tx.amountIn,
        };
      }),
    });
  }
}
