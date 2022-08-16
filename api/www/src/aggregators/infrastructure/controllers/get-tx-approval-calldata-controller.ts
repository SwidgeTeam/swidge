import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { GetTxApprovalCalldataDto } from './get-tx-approval-calldata-dto';
import BuildTxApprovalQuery from '../../application/query/build-tx-approval-query';
import { TransactionDetails } from '../../../shared/domain/transaction-details';

@Controller()
export class GetTxApprovalCalldataController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('build-tx-approval')
  async build(@Query() params: GetTxApprovalCalldataDto, @Res() res: Response) {
    const query = new BuildTxApprovalQuery(
      params.aggregatorId,
      params.routeId,
      params.senderAddress,
    );

    const tx = await this.queryBus.execute<BuildTxApprovalQuery, TransactionDetails>(query);

    return res.json({
      tx: {
        to: tx.to,
        data: tx.callData,
        value: tx.value.toString(),
        gasLimit: tx.gasLimit.toString(),
      },
    });
  }
}
