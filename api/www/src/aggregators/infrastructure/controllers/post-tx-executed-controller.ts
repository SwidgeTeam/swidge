import { Controller, Post, Query, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { PostTxExecutedDto } from './post-tx-executed-dto';
import { ExecutedTxCommand } from '../../application/command/executed-tx-command';

@Controller()
export class PostTxExecutedController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('tx-executed')
  async build(@Query() params: PostTxExecutedDto, @Res() res: Response) {
    const command = new ExecutedTxCommand(
      params.aggregatorId,
      params.fromAddress,
      params.toAddress,
      params.txHash,
      params.trackingId,
    );

    await this.commandBus.execute<ExecutedTxCommand, void>(command);

    return res.json({
      status: 'ok',
    });
  }
}
