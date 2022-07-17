import { Controller, Get, Res } from '@nestjs/common';
import { CustomController } from '../../../shared/infrastructure/CustomController';
import { Response } from 'express';
import { QueryBus } from '@nestjs/cqrs';
import { GetRouterAddressQuery } from '../../application/query/get-router-address.query';

@Controller()
export class GetRouterAddressController extends CustomController {
  constructor(private readonly queryBus: QueryBus) {
    super();
  }

  @Get('/address/router')
  public async getAddresses(@Res() res: Response) {
    const routerAddress = await this.queryBus.execute(new GetRouterAddressQuery());

    return res.json({
      address: routerAddress,
    });
  }
}
