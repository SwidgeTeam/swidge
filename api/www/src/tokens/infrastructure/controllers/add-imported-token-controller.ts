import { Body, Controller, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { AddImportedTokenDto } from './add-imported-token-dto';
import { AddImportedTokenCommand } from '../../application/command/add-imported-token-command';

@Controller()
export class AddImportedTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('imported-token')
  async addImportedToken(@Body() token: AddImportedTokenDto, @Res() res: Response) {
    const command = new AddImportedTokenCommand(token.chainId, token.address, token.wallet);
    await this.commandBus.execute<AddImportedTokenDto, void>(command);

    return res.json({
      status: 'ok',
    });
  }
}
