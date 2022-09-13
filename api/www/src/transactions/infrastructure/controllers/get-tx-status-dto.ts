import { IsTxHash } from '../../../shared/infrastructure/validators/txHashValidator';

export class GetTxStatusDto {
  @IsTxHash()
  txHash: string;
}
