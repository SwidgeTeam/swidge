import { Controller, Put, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { UpdateTokensPriceCommand } from '../../application/command/update-tokens-price-command';

@Controller()
export class UpdateTokensPriceController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('update-tokens-price')
  async updatePrice(@Res() res: Response) {
    const command = new UpdateTokensPriceCommand();
    await this.commandBus.execute<UpdateTokensPriceCommand, void>(command);

    return res.json({
      status: 'ok',
    });
  }
}
