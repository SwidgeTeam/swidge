import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { GetPathQuery } from '../../application/query/get-path.query';
import { GetPathDto } from './get-path-dto';
import { Token } from '../../../shared/domain/token';
import { Route } from '../../../shared/domain/route/route';

@Controller()
export class GetPathController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('path')
  async getPossiblePath(@Query() getPathDto: GetPathDto, @Res() res: Response) {
    const srcToken = new Token(
      getPathDto.fromChainId,
      getPathDto.srcTokenSymbol,
      getPathDto.srcTokenAddress,
      getPathDto.srcTokenDecimals,
      getPathDto.srcTokenSymbol,
    );
    const dstToken = new Token(
      getPathDto.toChainId,
      getPathDto.dstTokenSymbol,
      getPathDto.dstTokenAddress,
      getPathDto.dstTokenDecimals,
      getPathDto.dstTokenSymbol,
    );
    const query = new GetPathQuery(
      srcToken,
      dstToken,
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
    return {
      amountOut: route.amountOut,
      id: route.id,
      tags: route.tags,
      aggregator: {
        id: route.aggregator.id,
        routeId: route.aggregator.routeId,
        requiresCallDataQuoting: route.aggregator.requiresCallDataQuoting,
        bothQuotesInOne: route.aggregator.bothQuotesInOne,
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
        executionTime: route.resume.estimatedTime,
      },
      fees: {
        amount: route.fees.nativeWei.toString(),
        amountInUsd: route.fees.feeInUsd.toString(),
      },
      providers: route.providers.map((provider) => {
        return {
          name: provider.name,
          logo: provider.logo,
        };
      }),
      approvalContract: route.approvalContract ? route.approvalContract : null,
      mainTx: route.transaction
        ? {
            to: route.transaction.to,
            callData: route.transaction.callData,
            value: route.transaction.value.toString(),
            gasLimit: route.transaction.gasLimit.toString(),
          }
        : null,
    };
  }

  private mapTokenDetails(token: Token) {
    return {
      chainId: token.chainId,
      name: token.name,
      address: token.address,
      decimals: token.decimals,
      symbol: token.symbol,
      icon: token.logo,
    };
  }
}
