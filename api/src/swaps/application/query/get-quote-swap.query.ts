export class GetQuoteSwapQuery {
  constructor(
    public readonly chainId: string,
    public readonly srcToken: string,
    public readonly dstToken: string,
    public readonly amount: string,
  ) {}
}
