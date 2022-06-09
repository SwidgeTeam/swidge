import { Controller, Get, Param, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetTransactionQuery } from '../../application/query/get-transaction.query';
import { Response } from 'express';
import { CustomController } from '../../../shared/infrastructure/CustomController';
import { Transaction } from '../../domain/Transaction';

@Controller()
export class GetTransactionController extends CustomController {
  constructor(private readonly queryBus: QueryBus) {
    super();
  }

  @Get('/transaction/:hash')
  async getTransaction(@Param('hash') txHash: string, @Res() res: Response) {
    const query = new GetTransactionQuery(txHash);

    const errors = await this.validate(query);

    if (errors) {
      return res.status(400).json({
        errors: errors,
      });
    }

    const transaction = await this.queryBus.execute<
      GetTransactionQuery,
      Transaction
    >(query);

    return res.json({
      txHash: transaction.txHash,
      walletAddress: transaction.walletAddress,
      routerAddress: transaction.routerAddress,
      fromChainId: transaction.fromChainId,
      toChainId: transaction.toChainId,
      srcToken: transaction.srcToken,
      bridgeTokenIn: transaction.bridgeTokenIn,
      bridgeTokenOut: transaction.bridgeTokenOut,
      dstToken: transaction.dstToken,
      amountIn: transaction.amountIn,
      bridgeAmountIn: transaction.bridgeAmountIn,
      bridgeAmountOut: transaction.bridgeAmountOut,
      amountOut: transaction.amountOut,
      executed: transaction.executed,
      bridged: transaction.bridged,
      completed: transaction.completed,
    });
  }
}
