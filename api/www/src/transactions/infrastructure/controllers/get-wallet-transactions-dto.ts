import { IsEthereumAddress } from 'class-validator';

export class GetWalletTransactionsDto {
  @IsEthereumAddress()
  wallet: string;
}
