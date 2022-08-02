import { Body, Controller, Post, Res, SetMetadata } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { AddTokensDto } from './add-tokens-dto';
import { AddTokensCommand } from '../../application/command/add-tokens-command';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AUTH_GUARD_CONFIG, AuthGuardConfig } from '../../../shared/infrastructure/AuthGuard';

@Controller()
export class AddTokensController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiBearerAuth()
  @Post('add-tokens')
  @SetMetadata(AUTH_GUARD_CONFIG, { protected: true } as AuthGuardConfig)
  async addTokens(@Body() tokens: AddTokensDto, @Res() res: Response) {
    const command = new AddTokensCommand(tokens.list);
    await this.commandBus.execute<AddTokensCommand, void>(command);

    return res.json({
      status: 'ok',
    });
  }
}
