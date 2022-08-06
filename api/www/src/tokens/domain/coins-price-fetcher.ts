export interface CoinsPriceFetcher {
  fetch(ids: string[]): Promise<
    {
      id: string;
      price: number;
    }[]
  >;
}
