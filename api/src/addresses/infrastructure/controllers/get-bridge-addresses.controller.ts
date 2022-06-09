import { Controller, Get, Query, Res } from '@nestjs/common';
import { CustomController } from '../../../shared/infrastructure/CustomController';
import { Response } from 'express';
import { QueryBus } from '@nestjs/cqrs';
import { GetBridgeAddressesQuery } from '../../application/query/get-bridge-addresses.query';

@Controller()
export class GetBridgeAddressesController extends CustomController {
  constructor(private readonly queryBus: QueryBus) {
    super();
  }

  @Get('/address/bridge')
  public async getAddresses(@Query('type') type: string, @Res() res: Response) {
    const addresses = await this.queryBus.execute(
      new GetBridgeAddressesQuery(type),
    );

    return res.json({
      addresses: addresses.contracts.map((address) => {
        return {
          chainId: address.chainId,
          address: address.address,
        };
      }),
    });
  }
}
