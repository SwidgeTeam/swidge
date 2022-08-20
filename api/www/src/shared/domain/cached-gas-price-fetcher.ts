import { BigInteger } from './big-integer';
import { IGasPriceFetcher } from './gas-price-fetcher';
import { GasPriceFetcher } from '../infrastructure/gas-price-fetcher';

export class CachedGasPriceFetcher implements IGasPriceFetcher {
  private gasFetcher: GasPriceFetcher;
  private results: Map<string, BigInteger>;
  private deadline: Map<string, number>;
  private readonly CACHE_TIME = 15 * 1000; // 15 seconds

  constructor() {
    this.gasFetcher = GasPriceFetcher.create();
    this.results = new Map<string, BigInteger>();
    this.deadline = new Map<string, number>();
  }

  /**
   * Entrypoint
   * @param chainId
   */
  public async fetch(chainId: string): Promise<BigInteger> {
    if (this.isCached(chainId)) {
      return this.results.get(chainId);
    }
    const gasPrice = await this.gasFetcher.fetch(chainId);
    this.setCache(chainId, gasPrice);
    return gasPrice;
  }

  /**
   * Checks if result is cached and still valid
   * @param chainId
   * @private
   */
  private isCached(chainId: string): boolean {
    if (!this.results.has(chainId)) {
      return false;
    }
    return new Date().getTime() < this.deadline.get(chainId);
  }

  /**
   * Sets results and updated deadline for this chain
   * @param chainId
   * @param gasPrice
   * @private
   */
  private setCache(chainId: string, gasPrice: BigInteger): void {
    this.results.set(chainId, gasPrice);
    this.deadline.set(chainId, this.getDeadline());
  }

  /**
   * Computes the deadline given the current time
   * @private
   */
  private getDeadline(): number {
    return new Date().getTime() + this.CACHE_TIME;
  }
}
