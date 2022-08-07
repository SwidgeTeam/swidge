import { Controller, Get, Query, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { GetPathQuery } from '../../application/query/get-path.query';
import { GetPathDto } from './get-path-dto';
import { Token } from '../../../shared/domain/Token';
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
    );

    const router = await this.queryBus.execute<GetPathQuery, Route[]>(query);

    return res.json({
      routes: router.map((route) => this.mapRoute(route)),
    });
  }

  private mapRoute(route: Route) {
    return {
      tx: {
        to: route.transactionDetails.to,
        callData: route.transactionDetails.callData,
        value: route.transactionDetails.value.toString(),
        gasLimit: route.transactionDetails.gasLimit.toString(),
        gasPrice: route.transactionDetails.gasPrice.toString(),
      },
      amountOut: route.amountOut,
      steps: route.steps.map((step) => {
        return {
          type: step.type,
          name: step.name,
          logo: step.logo,
          tokenIn: this.mapTokenDetails(step.tokenIn),
          tokenOut: this.mapTokenDetails(step.tokenOut),
          fee: step.feeInUSD,
        };
      }),
    };
  }

  private mapTokenDetails(token: Token) {
    return {
      name: token.name,
      address: token.address,
    };
  }
}
