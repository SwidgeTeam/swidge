import { PriceFeedFetcher } from '../../../src/shared/infrastructure/PriceFeedFetcher';
import { stub } from 'sinon';
import { PriceFeed } from '../../../src/shared/domain/PriceFeed';
import { BigInteger } from '../../../src/shared/domain/BigInteger';
import { ZeroEx } from '../../../src/swaps/domain/providers/zero-ex';
import { createMock } from 'ts-auto-mock';
import { HttpClient } from '../../../src/shared/infrastructure/http/httpClient';

export function getPriceFeedFetcher(responses: { chain: string; result: string }[]) {
  const priceFeedFetcher = new PriceFeedFetcher();
  const fetcherStub = stub(priceFeedFetcher, 'fetch');
  for (const response of responses) {
    const priceFeed = new PriceFeed(BigInteger.fromString(response.result), 8);
    fetcherStub.withArgs(response.chain).resolves(priceFeed);
  }
  return priceFeedFetcher;
}

export function getZeroEx() {
  return new ZeroEx(httpClientMock());
}

function httpClientMock() {
  return createMock<HttpClient>();
}
