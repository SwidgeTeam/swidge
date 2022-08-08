import { Token } from './Token';
import { ProviderDetails } from './provider-details';

export class RouteStep {
  public static TYPE_SWAP = 'swap';
  public static TYPE_BRIDGE = 'bridge';

  public static swap(
    providerDetails: ProviderDetails,
    tokenIn: Token,
    tokenOut: Token,
    feeInUSD: string,
  ) {
    return new RouteStep(RouteStep.TYPE_SWAP, providerDetails, tokenIn, tokenOut, feeInUSD);
  }

  public static bridge(
    providerDetails: ProviderDetails,
    tokenIn: Token,
    tokenOut: Token,
    feeInUSD: string,
  ) {
    return new RouteStep(RouteStep.TYPE_BRIDGE, providerDetails, tokenIn, tokenOut, feeInUSD);
  }

  constructor(
    private readonly _type: string,
    private readonly _providerDetails: ProviderDetails,
    private readonly _tokenIn: Token,
    private readonly _tokenOut: Token,
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

  get feeInUSD(): string {
    return this._feeInUSD;
  }
}
