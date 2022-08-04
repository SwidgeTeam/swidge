export interface TokenDollarValueFetcher {
  fetch(id: string): Promise<number>;
}
