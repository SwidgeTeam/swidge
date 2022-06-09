import { ContractAddress } from '../../shared/types';
import { BigInteger } from '../../shared/domain/BigInteger';
import { Token } from '../../shared/domain/Token';

export class SwapOrder {
  public static notRequired() {
    return new SwapOrder(
      null,
      Token.null(),
      Token.null(),
      null,
      null,
      null,
      false,
    );
  }

  constructor(
    private readonly _providerCode: number,
    private readonly _tokenIn: Token,
    private readonly _tokenOut: Token,
    private readonly _approvalAddress: ContractAddress,
    private readonly _data: string,
    private readonly _buyAmount: BigInteger,
    private readonly _required: boolean,
  ) {}

  get providerCode(): number {
    return this._providerCode;
  }

  get tokenIn(): Token {
    return this._tokenIn;
  }

  get tokenOut(): Token {
    return this._tokenOut;
  }

  get approvalAddress(): string {
    return this._approvalAddress;
  }

  get data(): string {
    return this._data;
  }

  get buyAmount(): BigInteger {
    return this._buyAmount;
  }

  get buyAmountDecimal(): string {
    if (this._required) {
      return this._buyAmount.toDecimal(this._tokenOut.decimals);
    } else {
      return '';
    }
  }

  get required(): boolean {
    return this._required;
  }
}
