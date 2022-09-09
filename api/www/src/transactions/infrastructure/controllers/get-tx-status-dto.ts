import { IsNotEmpty, IsString } from 'class-validator';
import { IsTxHash } from '../../../shared/infrastructure/validators/txHashValidator';

export class GetTxStatusDto {
  @IsString()
  @IsNotEmpty()
  aggregatorId: string;

  @IsString()
  @IsNotEmpty()
  fromChainId: string;

  @IsString()
  @IsNotEmpty()
  toChainId: string;

  @IsTxHash()
  txHash: string;

  @IsString()
  @IsNotEmpty()
  trackingId: string;
}
