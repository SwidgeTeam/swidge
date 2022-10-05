import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import CheckTxStatusQuery from '../../application/query/check-tx-status-query';
import { GetTxStatusDto } from './get-tx-status-dto';
import { Transaction } from '../../domain/Transaction';

@Controller()
export class GetTxStatusController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('tx-status')
  async build(@Query() params: GetTxStatusDto, @Res() res: Response) {
    const query = new CheckTxStatusQuery(params.txId);

    const tx = await this.queryBus.execute<CheckTxStatusQuery, Transaction | null>(query);

    return res.json({
      txId: tx ? tx.id : '',
      status: tx ? tx.status : '',
      amountOut: tx ? tx.amountOut : '',
      dstTxHash: tx ? tx.destinationTxHash : '',
    });
  }
}
