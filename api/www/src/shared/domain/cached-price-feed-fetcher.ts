import { IPriceFeedFetcher } from './price-feed-fetcher';
import { PriceFeed } from './price-feed';
import { PriceFeedFetcher } from '../infrastructure/price-feed-fetcher';

export class CachedPriceFeedFetcher implements IPriceFeedFetcher {
  private feedFetcher: PriceFeedFetcher;
  private results: Map<string, PriceFeed>;
  private deadline: Map<string, number>;
  private readonly CACHE_TIME = 15 * 1000; // 15 seconds

  constructor() {
    this.feedFetcher = PriceFeedFetcher.create();
    this.results = new Map<string, PriceFeed>();
    this.deadline = new Map<string, number>();
  }

  /**
   * Entrypoint
   * @param chainId
   */
  public async fetch(chainId: string): Promise<PriceFeed> {
    if (this.isCached(chainId)) {
      return this.results.get(chainId);
    }
    const priceFeed = await this.feedFetcher.fetch(chainId);
    this.setCache(chainId, priceFeed);
    return priceFeed;
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
   * @param priceFeed
   * @private
   */
  private setCache(chainId: string, priceFeed: PriceFeed): void {
    this.results.set(chainId, priceFeed);
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
