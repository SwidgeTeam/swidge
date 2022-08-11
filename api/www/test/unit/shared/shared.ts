import { PriceFeedFetcher } from '../../../src/shared/infrastructure/PriceFeedFetcher';
import { stub } from 'sinon';
import { PriceFeed } from '../../../src/shared/domain/PriceFeed';
import { BigInteger } from '../../../src/shared/domain/BigInteger';
import { ZeroEx } from '../../../src/swaps/domain/providers/zero-ex';
import { createMock } from 'ts-auto-mock';
import { HttpClient } from '../../../src/shared/infrastructure/http/httpClient';
import { Sushiswap } from '../../../src/swaps/domain/providers/sushiswap';
import { SushiPairsRepository } from '../../../src/swaps/domain/sushi-pairs-repository';
import { TokenDetailsFetcher } from '../../../src/shared/infrastructure/TokenDetailsFetcher';

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
  return new Sushiswap(httpClientMock(), sushiRepositoryMock());
}

export function httpClientMock() {
  return createMock<HttpClient>();
}

export function sushiRepositoryMock() {
  return createMock<SushiPairsRepository>();
}

export function getTokenDetailsFetcher(results: any[]): TokenDetailsFetcher {
  const fetcher = new TokenDetailsFetcher();
  const mockTokenFetcher = stub(fetcher, 'fetch');
  for (let i = 0; i < results.length; i++) {
    mockTokenFetcher.onCall(i).resolves(results[i]);
  }
  return fetcher;
}
