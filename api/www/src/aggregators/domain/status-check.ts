import { BigInteger } from '../../shared/domain/big-integer';

export interface StatusCheckRequest {
  fromChain: string;
  toChain: string;
  txHash: string;
  trackingId: string;
}

export interface StatusCheckResponse {
  status: ExternalTransactionStatus;
  srcTxHash: string;
  dstTxHash: string | undefined;
  amountIn: BigInteger;
  amountOut: BigInteger;
  fromToken: string;
  toToken: string;
}

export enum ExternalTransactionStatus {
  Pending,
  Failed,
  Success,
}
