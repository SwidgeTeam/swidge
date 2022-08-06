export interface TokensPriceFetcher {
  fetch(
    addresses: string[],
    chainId: string,
  ): Promise<
    {
      address: string;
      price: number;
    }[]
  >;
}
