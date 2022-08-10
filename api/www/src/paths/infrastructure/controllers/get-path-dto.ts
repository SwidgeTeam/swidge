import { IsEthereumAddress, IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { IsPositiveFloatString } from '../../../shared/infrastructure/validators/floatAmountValidator';

export class GetPathDto {
  @IsString()
  @IsNotEmpty()
  fromChainId: string;

  @IsEthereumAddress()
  srcToken: string;

  @IsString()
  @IsNotEmpty()
  toChainId: string;

  @IsEthereumAddress()
  dstToken: string;

  @IsPositiveFloatString()
  amount: string;

  @IsNumberString()
  slippage: number;
}
