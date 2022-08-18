import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import BuildTxApprovalQuery from '../../application/query/build-tx-approval-query';
import { GetTxCalldataDto } from './get-tx-calldata-dto';
import BuildTxQuery from '../../application/query/build-tx-query';
import { TransactionDetails } from '../../../shared/domain/transaction-details';

@Controller()
export class GetTxCalldataController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('build-tx')
  async build(@Query() params: GetTxCalldataDto, @Res() res: Response) {
    const query = new BuildTxQuery(
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
