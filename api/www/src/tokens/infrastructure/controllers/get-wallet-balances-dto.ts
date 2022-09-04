import { IsEthereumAddress } from 'class-validator';

export class GetWalletBalancesDto {
  @IsEthereumAddress()
  wallet: string;
}
