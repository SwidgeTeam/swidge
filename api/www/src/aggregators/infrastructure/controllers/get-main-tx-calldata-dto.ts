import { IsEthereumAddress, IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { IsPositiveFloatString } from '../../../shared/infrastructure/validators/floatAmountValidator';

export class GetMainTxCalldataDto {
  @IsString()
  @IsNotEmpty()
  aggregatorId: string;

  @IsString()
  routeId: string;

  @IsString()
  @IsNotEmpty()
  fromChainId: string;

  @IsEthereumAddress()
  srcTokenAddress: string;

  @IsString()
  @IsNotEmpty()
  srcTokenSymbol: string;

  @IsNumberString()
  srcTokenDecimals: number;

  @IsString()
  @IsNotEmpty()
  toChainId: string;

  @IsEthereumAddress()
  dstTokenAddress: string;

  @IsString()
  @IsNotEmpty()
  dstTokenSymbol: string;

  @IsNumberString()
  dstTokenDecimals: number;

  @IsPositiveFloatString()
  amount: string;

  @IsNumberString()
  slippage: number;

  @IsEthereumAddress()
  senderAddress: string;

  @IsEthereumAddress()
  receiverAddress: string;
}
