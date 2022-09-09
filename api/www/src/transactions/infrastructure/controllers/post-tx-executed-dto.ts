import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';
import { IsTxHash } from '../../../shared/infrastructure/validators/txHashValidator';

export class PostTxExecutedDto {
  @IsString()
  @IsNotEmpty()
  aggregatorId: string;

  @IsEthereumAddress()
  wallet: string;

  @IsString()
  @IsNotEmpty()
  fromChainId: string;

  @IsString()
  @IsNotEmpty()
  toChainId: string;

  @IsEthereumAddress()
  fromAddress: string;

  @IsEthereumAddress()
  toAddress: string;

  @IsTxHash()
  txHash: string;

  @IsString()
  @IsNotEmpty()
  trackingId: string;
}
