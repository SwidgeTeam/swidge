import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class AddImportedTokenDto {
  @IsString()
  @IsNotEmpty()
  chainId: string;

  @IsEthereumAddress()
  address: string;

  @IsEthereumAddress()
  wallet: string;
}
