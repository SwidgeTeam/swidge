import { IsNumber, ValidateIf } from 'class-validator';
import { IsTxHash } from '../../../shared/infrastructure/validators/txHashValidator';
import { IsPositiveIntegerString } from '../../../shared/infrastructure/validators/integerAmountValidator';

export class UpdateTransactionCommand {
  @IsTxHash()
  txHash: string;

  @ValidateIf((o) => o.amountOut !== '')
  @IsPositiveIntegerString()
  amountOut: string;

  @ValidateIf((o) => o.bridgeAmountIn !== '')
  @IsPositiveIntegerString()
  bridgeAmountIn: string;

  @ValidateIf((o) => o.bridgeAmountOut !== '')
  @IsPositiveIntegerString()
  bridgeAmountOut: string;

  @ValidateIf((o) => o.bridged !== '')
  @IsNumber()
  bridged: string;

  @ValidateIf((o) => o.completed !== '')
  @IsNumber()
  completed: string;
}
