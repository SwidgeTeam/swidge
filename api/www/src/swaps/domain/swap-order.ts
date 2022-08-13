import { BigInteger } from '../../shared/domain/big-integer';
import { Token } from '../../shared/domain/token';

export class SwapOrder {
  public static notRequired() {
    return new SwapOrder(
      '0',
      Token.null(),
      Token.null(),
      '0x',
      BigInteger.zero(),
      BigInteger.zero(),
      BigInteger.zero(),
      BigInteger.zero(),
      BigInteger.zero(),
      false,
    );
  }

  public static sameToken(token: Token) {
    return new SwapOrder(
      '0',
      token,
      token,
      '0x',
      BigInteger.zero(),
      BigInteger.zero(),
      BigInteger.zero(),
      BigInteger.zero(),
      BigInteger.zero(),
      false,
    );
  }

  constructor(
    private readonly _providerCode: string,
    private readonly _tokenIn: Token,
    private readonly _tokenOut: Token,
    private readonly _data: string,
    private readonly _amountIn: BigInteger,
    private readonly _expectedAmountOut: BigInteger,
    private readonly _expectedMinAmountOut: BigInteger,
    private readonly _worstCaseAmountOut: BigInteger,
    private readonly _estimatedGas: BigInteger,
    private readonly _required = true,
  ) {}

  get providerCode(): string {
    return this._providerCode;
  }

  get tokenIn(): Token {
    return this._tokenIn;
  }

  get tokenOut(): Token {
    return this._tokenOut;
  }

  get data(): string {
    return this._data;
  }

  get amountIn(): BigInteger {
    return this._amountIn;
  }

  get expectedAmountOut(): BigInteger {
    return this._expectedAmountOut;
  }

  get expectedMinAmountOut(): BigInteger {
    return this._expectedMinAmountOut;
  }

  get worstCaseAmountOut(): BigInteger {
    return this._worstCaseAmountOut;
  }

  get estimatedGas(): BigInteger {
    return this._estimatedGas;
  }

  get required(): boolean {
    return this._required;
  }
}
