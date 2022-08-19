import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class GetApprovalTxCalldataDto {
  @IsString()
  @IsNotEmpty()
  aggregatorId: string;

  @IsString()
  @IsNotEmpty()
  routeId: string;

  @IsEthereumAddress()
  senderAddress: string;
}
