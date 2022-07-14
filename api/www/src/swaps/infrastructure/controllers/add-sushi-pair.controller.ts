import { Controller, Get, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AddSushiPairCommand } from '../../application/command/add-sushi-pair.command';

@Controller()
export class UpdateSushiPairsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/add/sushi-pairs')
  async getSwapQuote(
    @Query('chainId') chainId: string,
    @Query('token0') token0: string,
    @Query('token1') token1: string,
  ) {
    const query = new AddSushiPairCommand(chainId, token0, token1);

    await this.commandBus.execute<AddSushiPairCommand, void>(query);

    return 'ok';
  }
}
