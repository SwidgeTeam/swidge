import { AggregatorMetadata, IChain, IToken } from '../../shared/domain/metadata';

export default class Metadata {
  private readonly _chains: IChain[];
  private readonly _tokens: IToken[];

  constructor() {
    this._chains = [];
    this._tokens = [];
  }

  public includeAggregatorMetadata(meta: AggregatorMetadata) {
    for (const chain of meta.chains) {
      if (!this.containsChain(chain.type, chain.id)) {
        this._chains.push(chain);
      }
    }
    for (const token of meta.tokens) {
      if (!this.containsToken(token.chainId, token.address)) {
        this._tokens.push(token);
      }
    }
  }

  get chains(): IChain[] {
    return this._chains;
  }

  get tokens(): IToken[] {
    return this._tokens;
  }

  private containsChain(type: string, chainId: string): boolean {
    const chain = this._chains.find((chain) => chain.type === type && chain.id === chainId);
    return chain !== undefined;
  }

  private containsToken(chainId: string, address: string): boolean {
    const chain = this._tokens.find(
      (token) => token.chainId === chainId && token.address === address,
    );
    return chain !== undefined;
  }
}
