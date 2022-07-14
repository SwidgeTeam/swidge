import { Controller, Get } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateSushiPairsCommand } from '../../application/command/update-sushi-pairs.command';

@Controller()
export class UpdateSushiPairsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/refresh/sushi-pairs')
  async getSwapQuote() {
    const query = new UpdateSushiPairsCommand();

    await this.commandBus.execute<UpdateSushiPairsCommand, void>(query);

    return 'ok';
  }
}
