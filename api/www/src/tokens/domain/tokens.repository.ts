export interface TokensRepository {
  addImported(chainId: string, address: string, wallet: string): Promise<void>;
}
