import { Token } from './Token';

export class RouteStep {
  public static TYPE_SWAP = 'swap';
  public static TYPE_BRIDGE = 'bridge';

  public static swap(
    name: string,
    logo: string,
    tokenIn: Token,
    tokenOut: Token,
    feeInUSD: string,
  ) {
    return new RouteStep(RouteStep.TYPE_SWAP, name, logo, tokenIn, tokenOut, feeInUSD);
  }

  public static bridge(
    name: string,
    logo: string,
    tokenIn: Token,
    tokenOut: Token,
    feeInUSD: string,
  ) {
    return new RouteStep(RouteStep.TYPE_BRIDGE, name, logo, tokenIn, tokenOut, feeInUSD);
  }

  constructor(
    private readonly _type: string,
    private readonly _name: string,
    private readonly _logo: string,
    private readonly _tokenIn: Token,
    private readonly _tokenOut: Token,
    private readonly _feeInUSD: string,
  ) {}

  get type(): string {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get logo(): string {
    return this._logo;
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
