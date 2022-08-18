import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class GetTxCalldataDto {
  @IsString()
  @IsNotEmpty()
  aggregatorId: string;

  @IsString()
  @IsNotEmpty()
  routeId: string;

  @IsEthereumAddress()
  senderAddress: string;

  @IsEthereumAddress()
  receiverAddress: string;
}
