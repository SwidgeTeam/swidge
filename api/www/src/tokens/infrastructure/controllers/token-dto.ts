import { IsEthereumAddress, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  chainId: string;

  @IsEthereumAddress()
  address: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsNumber()
  decimals: number;

  @IsNotEmpty()
  @IsString()
  logo: string;
}
