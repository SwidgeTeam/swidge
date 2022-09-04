interface TokenBalance {
  chainId: string;
  address: string;
  hex_amount: string;
}

export interface WalletBalances {
  tokens: TokenBalance[];
}
