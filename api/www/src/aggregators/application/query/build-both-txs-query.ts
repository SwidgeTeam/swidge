import { BigInteger } from '../../../shared/domain/big-integer';
import { Token } from '../../../shared/domain/token';

export default class BuildBothTxsQuery {
  constructor(
    readonly aggregatorId: string,
    readonly srcToken: Token,
    readonly dstToken: Token,
    readonly amount: BigInteger,
    readonly slippage: number,
    readonly senderAddress: string,
    readonly receiverAddress: string,
  ) {}
}
