import { Controller, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { CheckPendingTxsCommand } from '../../application/command/check-pending-txs-command';

@Controller()
export class CheckPendingTxsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('check-pending-txs')
  async check(@Res() res: Response) {
    const command = new CheckPendingTxsCommand();

    this.commandBus.execute<CheckPendingTxsCommand, void>(command);

    return res.json({
      status: 'ok',
    });
  }
}
