import { Token } from '../../../shared/domain/token';
import { BigInteger } from '../../../shared/domain/big-integer';

export default class BuildMainTxQuery {
  constructor(
    readonly aggregatorId: string,
    readonly routeId: string,
    readonly srcToken: Token,
    readonly dstToken: Token,
    readonly amount: BigInteger,
    readonly slippage: number,
    readonly senderAddress: string,
    readonly receiverAddress: string,
  ) {}
}
