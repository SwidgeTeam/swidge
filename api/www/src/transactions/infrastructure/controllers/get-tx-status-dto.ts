import { IsNotEmpty, IsString } from 'class-validator';

export class GetTxStatusDto {
  @IsString()
  @IsNotEmpty()
  txId: string;
}
