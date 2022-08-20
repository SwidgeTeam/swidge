import { CachedGasPriceFetcher } from '../../../../src/shared/domain/cached-gas-price-fetcher';
import { restore, stub } from 'sinon';
import { GasPriceFetcher } from '../../../../src/shared/infrastructure/gas-price-fetcher';
import { createMock } from 'ts-auto-mock';
import { IGasPriceFetcher } from '../../../../src/shared/domain/gas-price-fetcher';
import { method, On } from 'ts-auto-mock/extension';
import { IPriceFeedFetcher } from '../../../../src/shared/domain/price-feed-fetcher';
import { PriceFeedFetcher } from '../../../../src/shared/infrastructure/price-feed-fetcher';
import { CachedPriceFeedFetcher } from '../../../../src/shared/domain/cached-price-feed-fetcher';

describe('cached-price-feed-fetcher', () => {
  afterEach(() => {
    restore();
  });

  it('should only request gas one time when same arguments', async () => {
    // Arrange
    const fetcherMock = createMock<IPriceFeedFetcher>();
    stub(PriceFeedFetcher, 'create').returns(fetcherMock);
    const cachedFetcher = new CachedPriceFeedFetcher();
    const fetchSpy = On(fetcherMock).get(method('fetch'));

    // Act
    await cachedFetcher.fetch('1');
    await cachedFetcher.fetch('1');

    // Assert
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('should only request gas one time when different arguments', async () => {
    // Arrange
    const fetcherMock = createMock<IPriceFeedFetcher>();
    stub(PriceFeedFetcher, 'create').returns(fetcherMock);
    const cachedFetcher = new CachedPriceFeedFetcher();
    const fetchSpy = On(fetcherMock).get(method('fetch'));

    // Act
    await cachedFetcher.fetch('1');
    await cachedFetcher.fetch('2');

    // Assert
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
