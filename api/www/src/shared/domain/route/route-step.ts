import { Token } from '../token';
import { ProviderDetails } from '../provider-details';
import { BigInteger } from '../big-integer';

export class RouteStep {
  public static TYPE_SWAP = 'swap';
  public static TYPE_BRIDGE = 'bridge';

  public static swap(
    providerDetails: ProviderDetails,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: BigInteger,
    amountOut: BigInteger,
    feeInUSD: string,
  ) {
    return new RouteStep(
      RouteStep.TYPE_SWAP,
      providerDetails,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      feeInUSD,
    );
  }

  public static bridge(
    providerDetails: ProviderDetails,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: BigInteger,
    amountOut: BigInteger,
    feeInUSD: string,
  ) {
    return new RouteStep(
      RouteStep.TYPE_BRIDGE,
      providerDetails,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      feeInUSD,
    );
  }

  constructor(
    private readonly _type: string,
    private readonly _providerDetails: ProviderDetails,
    private readonly _tokenIn: Token,
    private readonly _tokenOut: Token,
    private readonly _amountIn: BigInteger,
    private readonly _amountOut: BigInteger,
    private readonly _feeInUSD: string,
  ) {}

  get type(): string {
    return this._type;
  }

  get name(): string {
    return this._providerDetails.name;
  }

  get logo(): string {
    return this._providerDetails.logo;
  }

  get tokenIn(): Token {
    return this._tokenIn;
  }

  get tokenOut(): Token {
    return this._tokenOut;
  }

  get amountIn(): BigInteger {
    return this._amountIn;
  }

  get amountOut(): BigInteger {
    return this._amountOut;
  }

  get feeInUSD(): string {
    return this._feeInUSD;
  }
}
