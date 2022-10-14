import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { GetMainTxCalldataDto } from './get-main-tx-calldata-dto';
import BuildMainTxQuery from '../../application/query/build-main-tx-query';
import { TransactionDetails } from '../../../shared/domain/route/transaction-details';
import { BigInteger } from '../../../shared/domain/big-integer';
import { Token } from '../../../shared/domain/token';
import { AggregatorTx } from '../../domain/aggregator';

@Controller()
export class GetMainTxCalldataController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('build-main-tx')
  async build(@Query() params: GetMainTxCalldataDto, @Res() res: Response) {
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

    const query = new BuildMainTxQuery(
      params.aggregatorId,
      params.routeId,
      srcToken,
      dstToken,
      BigInteger.fromDecimal(params.amount, srcToken.decimals),
      params.slippage,
      params.senderAddress,
      params.receiverAddress,
    );

    const tx = await this.queryBus.execute<BuildMainTxQuery, AggregatorTx>(query);

    return res.json({
      trackingId: tx.trackingId,
      approvalContract: tx.approvalContract,
      tx: {
        to: tx.tx.to,
        callData: tx.tx.callData,
        value: tx.tx.value.toString(),
        gasLimit: tx.tx.gasLimit.toString(),
      },
    });
  }
}
