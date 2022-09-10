import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { GetBothTxsCalldataDto } from './get-both-txs-calldata-dto';
import BuildBothTxsQuery from '../../application/query/build-both-txs-query';
import BothTxs from '../../domain/both-txs';
import { BigInteger } from '../../../shared/domain/big-integer';
import { Token } from '../../../shared/domain/token';

@Controller()
export class GetBothTxsCalldataController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('build-both-txs')
  async build(@Query() params: GetBothTxsCalldataDto, @Res() res: Response) {
    const srcToken = new Token(
      params.fromChainId,
      params.srcTokenSymbol,
      params.srcTokenAddress,
      params.srcTokenDecimals,
      params.srcTokenSymbol,
    );
    const dstToken = new Token(
      params.toChainId,
      params.dstTokenSymbol,
      params.dstTokenAddress,
      params.dstTokenDecimals,
      params.dstTokenSymbol,
    );
    const query = new BuildBothTxsQuery(
      params.aggregatorId,
      srcToken,
      dstToken,
      BigInteger.fromDecimal(params.amount, srcToken.decimals),
      params.slippage,
      params.senderAddress,
      params.receiverAddress,
    );

    const bothTxs = await this.queryBus.execute<BuildBothTxsQuery, BothTxs>(query);

    return res.json({
      trackingId: bothTxs.trackingId,
      approvalTx: {
        to: bothTxs.approvalTx.to,
        callData: bothTxs.approvalTx.callData,
        gasLimit: bothTxs.approvalTx.gasLimit.toString(),
      },
      mainTx: {
        to: bothTxs.mainTx.to,
        callData: bothTxs.mainTx.callData,
        value: bothTxs.mainTx.value.toString(),
        gasLimit: bothTxs.mainTx.gasLimit.toString(),
      },
    });
  }
}
