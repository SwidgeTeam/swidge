import { PriceFeedFetcher } from '../../../src/shared/infrastructure/price-feed-fetcher';
import { stub } from 'sinon';
import { PriceFeed } from '../../../src/shared/domain/price-feed';
import { BigInteger } from '../../../src/shared/domain/big-integer';
import { Logger } from '../../../src/shared/domain/logger';
import { ZeroEx } from '../../../src/swaps/domain/providers/zero-ex';
import { createMock } from 'ts-auto-mock';
import { Sushiswap } from '../../../src/swaps/domain/providers/sushiswap';
import { TokenDetailsFetcher } from '../../../src/shared/infrastructure/TokenDetailsFetcher';
import { IHttpClient } from '../../../src/shared/domain/http/IHttpClient';
import { SushiPoolsTheGraph } from '../../../src/swaps/infrastructure/theGraph/sushi-pools-the-graph';

export function getPriceFeedFetcher(responses: { chain: string; result: string }[]) {
  const priceFeedFetcher = new PriceFeedFetcher();
  const fetcherStub = stub(priceFeedFetcher, 'fetch');
  for (const response of responses) {
    const priceFeed = new PriceFeed(BigInteger.fromString(response.result), 8);
    fetcherStub.withArgs(response.chain).resolves(priceFeed);
  }
  return priceFeedFetcher;
}

export function getZeroEx(): ZeroEx {
  return new ZeroEx(httpClientMock());
}

export function getSushi(): Sushiswap {
  return new Sushiswap(sushiTheGraphMock());
}

export function httpClientMock(args = {}) {
  return createMock<IHttpClient>(args);
}

export function sushiTheGraphMock() {
  return new SushiPoolsTheGraph(httpClientMock());
}

export function getTokenDetailsFetcher(results: any[]): TokenDetailsFetcher {
  const fetcher = new TokenDetailsFetcher();
  const mockTokenFetcher = stub(fetcher, 'fetch');
  for (let i = 0; i < results.length; i++) {
    mockTokenFetcher.onCall(i).resolves(results[i]);
  }
  return fetcher;
}

export function loggerMock() {
  return createMock<Logger>();
}
