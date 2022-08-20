import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { GetApprovalTxCalldataDto } from './get-approval-tx-calldata-dto';
import BuildTxApprovalQuery from '../../application/query/build-tx-approval-query';
import { ApprovalTransactionDetails } from '../../../shared/domain/route/approval-transaction-details';

@Controller()
export class GetApprovalTxCalldataController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('build-approval-tx')
  async build(@Query() params: GetApprovalTxCalldataDto, @Res() res: Response) {
    const query = new BuildTxApprovalQuery(
      params.aggregatorId,
      params.routeId,
      params.senderAddress,
    );

    const tx = await this.queryBus.execute<BuildTxApprovalQuery, ApprovalTransactionDetails>(query);

    return res.json({
      tx: {
        to: tx.to,
        callData: tx.callData,
        gasLimit: tx.gasLimit.toString(),
      },
    });
  }
}
