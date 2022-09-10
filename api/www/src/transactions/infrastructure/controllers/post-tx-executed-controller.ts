import { Controller, Param, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { PostTxExecutedDto } from './post-tx-executed-dto';
import { ExecutedTxCommand } from '../../application/command/executed-tx-command';

@Controller()
export class PostTxExecutedController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('tx-executed')
  async build(@Param() params: PostTxExecutedDto, @Res() res: Response) {
    const command = new ExecutedTxCommand(
      params.aggregatorId,
      params.fromChainId,
      params.toChainId,
      params.fromAddress,
      params.toAddress,
      params.txHash,
      params.trackingId,
    );

    this.commandBus.execute<ExecutedTxCommand, void>(command);

    return res.json({
      status: 'ok',
    });
  }
}
