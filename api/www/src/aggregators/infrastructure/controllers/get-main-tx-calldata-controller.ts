import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import BuildTxApprovalQuery from '../../application/query/build-tx-approval-query';
import { GetMainTxCalldataDto } from './get-main-tx-calldata-dto';
import BuildMainTxQuery from '../../application/query/build-main-tx-query';
import { TransactionDetails } from '../../../shared/domain/route/transaction-details';

@Controller()
export class GetMainTxCalldataController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('build-main-tx')
  async build(@Query() params: GetMainTxCalldataDto, @Res() res: Response) {
    const query = new BuildMainTxQuery(
      params.aggregatorId,
      params.routeId,
      params.senderAddress,
      params.receiverAddress,
    );

    const tx = await this.queryBus.execute<BuildTxApprovalQuery, TransactionDetails>(query);

    return res.json({
      tx: {
        to: tx.to,
        callData: tx.callData,
        value: tx.value.toString(),
        gasLimit: tx.gasLimit.toString(),
      },
    });
  }
}
