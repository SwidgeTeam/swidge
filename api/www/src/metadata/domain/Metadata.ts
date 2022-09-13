import { AggregatorMetadata, IChain, ITokenList } from '../../shared/domain/metadata';

export default class Metadata {
  private readonly _chains: IChain[];
  private readonly _tokens: ITokenList;

  constructor() {
    this._chains = [];
    this._tokens = {};
  }

  public includeAggregatorMetadata(meta: AggregatorMetadata) {
    for (const chain of meta.chains) {
      if (!this.containsChain(chain.type, chain.id)) {
        this._chains.push(chain);
      }
    }
    for (const [chainId, tokens] of Object.entries(meta.tokens)) {
      if (!this._tokens[chainId]) {
        // chain didnt have tokens, include all
        this._tokens[chainId] = tokens;
      } else {
        // chain already exists
        for (const token of tokens) {
          // check every token to include the missing
          if (!this.containsToken(token.chainId, token.address)) {
            this._tokens[chainId].push(token);
          }
        }
      }
    }
  }

  get chains(): IChain[] {
    return this._chains;
  }

  get tokens(): ITokenList {
    return this._tokens;
  }

  private containsChain(type: string, chainId: string): boolean {
    const chain = this._chains.find((chain) => chain.type === type && chain.id === chainId);
    return chain !== undefined;
  }

  private containsToken(chainId: string, address: string): boolean {
    const chain = this._tokens[chainId].find(
      (token) => token.chainId === chainId && token.address === address,
    );
    return chain !== undefined;
  }
}
