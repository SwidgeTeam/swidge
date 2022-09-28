import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';
import { IsTxHash } from '../../../shared/infrastructure/validators/txHashValidator';

export class PostTxExecutedDto {
  @IsString()
  @IsNotEmpty()
  txId: string;

  @IsTxHash()
  txHash: string;

  @IsString()
  @IsNotEmpty()
  aggregatorId: string;

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

  @IsEthereumAddress()
  fromToken: string;

  @IsEthereumAddress()
  toToken: string;

  @IsString()
  @IsNotEmpty()
  amountIn: string;

  @IsString()
  trackingId: string;
}
