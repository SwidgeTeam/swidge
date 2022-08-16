import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { GetPathQuery } from '../../application/query/get-path.query';
import { GetPathDto } from './get-path-dto';
import { Token } from '../../../shared/domain/token';
import { Route } from '../../../shared/domain/route';

@Controller()
export class GetPathController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('path')
  async getPossiblePath(@Query() getPathDto: GetPathDto, @Res() res: Response) {
    const query = new GetPathQuery(
      getPathDto.fromChainId,
      getPathDto.toChainId,
      getPathDto.srcToken,
      getPathDto.dstToken,
      getPathDto.amount,
      getPathDto.slippage,
      getPathDto.senderAddress,
      getPathDto.receiverAddress,
    );

    const router = await this.queryBus.execute<GetPathQuery, Route[]>(query);

    return res.json({
      routes: router.map((route) => this.mapRoute(route)),
    });
  }

  private mapRoute(route: Route) {
    const txDetails = route.transactionDetails;
    const tx = txDetails
      ? {
          to: txDetails.to,
          approvalAddress: txDetails.approvalAddress,
          callData: txDetails.callData,
          value: txDetails.value.toString(),
          gasLimit: txDetails.gasLimit.toString(),
          gasPrice: txDetails.gasPrice.toString(),
        }
      : null;
    return {
      aggregator: {
        id: route.aggregator.id,
        routeId: route.aggregator.routeId,
        requireCallDataQuote: route.aggregator.requiresCallDataQuoting,
        trackingId: route.aggregator.trackingId,
      },
      resume: {
        fromChain: route.resume.fromChain,
        toChain: route.resume.toChain,
        tokenIn: this.mapTokenDetails(route.resume.fromToken),
        tokenOut: this.mapTokenDetails(route.resume.toToken),
        amountIn: route.resume.amountIn.toDecimal(route.resume.fromToken.decimals),
        amountOut: route.resume.amountOut.toDecimal(route.resume.toToken.decimals),
        minAmountOut: route.resume.minAmountOut.toDecimal(route.resume.toToken.decimals),
      },
      tx: tx,
      amountOut: route.amountOut,
      steps: route.steps.map((step) => {
        return {
          type: step.type,
          name: step.name,
          logo: step.logo,
          tokenIn: this.mapTokenDetails(step.tokenIn),
          tokenOut: this.mapTokenDetails(step.tokenOut),
          amountIn: step.amountIn.toDecimal(step.tokenIn.decimals),
          amountOut: step.amountOut.toDecimal(step.tokenOut.decimals),
          fee: step.feeInUSD,
        };
      }),
    };
  }

  private mapTokenDetails(token: Token) {
    return {
      name: token.name,
      address: token.address,
      decimals: token.decimals,
      symbol: token.symbol,
    };
  }
}
