import { Controller, Get, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AddSushiPoolsCommand } from '../../application/command/add-sushi-pools-command';

@Controller()
export class UpdateSushiPairsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/add/sushi-pools')
  async getSwapQuote(@Query('chainId') chainId: string) {
    const command = new AddSushiPoolsCommand(chainId);

    await this.commandBus.execute<AddSushiPoolsCommand, void>(command);

    return 'ok';
  }
}
