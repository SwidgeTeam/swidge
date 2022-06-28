import { Body, Controller, Param, Put, Res, SetMetadata } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { CustomController } from '../../../shared/infrastructure/CustomController';
import { UpdateTransactionCommand } from '../../application/command/update-transaction.command';
import {
  AUTH_GUARD_CONFIG,
  AuthGuardConfig,
} from '../../../shared/infrastructure/AuthGuard';

@Controller()
export class PutTransactionController extends CustomController {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  @Put('/transaction/:hash')
  @SetMetadata(AUTH_GUARD_CONFIG, { protected: true } as AuthGuardConfig)
  async postTransaction(
    @Param('hash') txHash,
    @Body('bridgeAmountIn') bridgeAmountIn,
    @Body('bridgeAmountOut') bridgeAmountOut,
    @Body('amountOut') amountOut,
    @Body('bridged') bridged,
    @Body('completed') completed,
    @Res() res: Response,
  ) {
    const command = new UpdateTransactionCommand();
    command.txHash = txHash;
    command.amountOut = amountOut;
    command.bridgeAmountIn = bridgeAmountIn;
    command.bridgeAmountOut = bridgeAmountOut;
    command.bridged = bridged;
    command.completed = completed;

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
