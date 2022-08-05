export interface CoinPriceFetcher {
  fetch(id: string): Promise<number>;
}
