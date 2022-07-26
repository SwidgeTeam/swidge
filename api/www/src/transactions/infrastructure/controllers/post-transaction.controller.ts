import { Body, Controller, Post, Res, SetMetadata } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../../application/command/create-transaction.command';
import { Response } from 'express';
import { CustomController } from '../../../shared/infrastructure/CustomController';
import { AUTH_GUARD_CONFIG, AuthGuardConfig } from '../../../shared/infrastructure/AuthGuard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class PostTransactionController extends CustomController {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  @Post('/transaction')
  @ApiBearerAuth()
  @SetMetadata(AUTH_GUARD_CONFIG, { protected: true } as AuthGuardConfig)
  async postTransaction(
    @Body('txHash') txHash,
    @Body('walletAddress') walletAddress,
    @Body('fromChainId') fromChainId,
    @Body('toChainId') toChainId,
    @Body('srcToken') srcToken,
    @Body('bridgeTokenIn') bridgeTokenIn,
    @Body('bridgeTokenOut') bridgeTokenOut,
    @Body('dstToken') dstToken,
    @Body('amount') amount,
    @Body('routerAddress') routerAddress,
    @Res() res: Response,
  ) {
    const command = new CreateTransactionCommand();
    command.txHash = txHash;
    command.walletAddress = walletAddress;
    command.fromChainId = fromChainId;
    command.toChainId = toChainId;
    command.srcToken = srcToken;
    command.bridgeTokenIn = bridgeTokenIn;
    command.bridgeTokenOut = bridgeTokenOut;
    command.dstToken = dstToken;
    command.routerAddress = routerAddress;
    command.amount = amount;

    const errors = await this.validate(command);

    if (errors) {
      return res.status(400).json({
        errors: errors,
      });
    }

    await this.commandBus.execute(command);

    return res.status(200).send();
  }
}
