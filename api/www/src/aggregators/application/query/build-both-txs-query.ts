import { BigInteger } from '../../../shared/domain/big-integer';

export default class BuildBothTxsQuery {
  constructor(
    readonly aggregatorId: string,
    readonly fromChainId: string,
    readonly srcToken: string,
    readonly toChainId: string,
    readonly dstToken: string,
    readonly amount: BigInteger,
    readonly slippage: number,
    readonly senderAddress: string,
    readonly receiverAddress: string,
  ) {}
}
