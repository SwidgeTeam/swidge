import { Token } from '../../shared/domain/token';
import { BigInteger } from '../../shared/domain/big-integer';

export class SwapRequest {
  constructor(
    public readonly chainId: string,
    public readonly tokenIn: Token,
    public readonly tokenOut: Token,
    public readonly slippage: number,
    public readonly amountIn: BigInteger,
    public readonly minAmountIn: BigInteger,
  ) {}
}
