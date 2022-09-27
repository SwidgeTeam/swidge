import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import CheckTxStatusQuery from '../../application/query/check-tx-status-query';
import { GetTxStatusDto } from './get-tx-status-dto';

@Controller()
export class GetTxStatusController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('tx-status')
  async build(@Query() params: GetTxStatusDto, @Res() res: Response) {
    const query = new CheckTxStatusQuery(params.txId);

    const status = await this.queryBus.execute<CheckTxStatusQuery, string>(query);

    return res.json({
      status: status,
    });
  }
}
