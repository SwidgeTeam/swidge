import { CachedGasPriceFetcher } from '../../../../src/shared/domain/cached-gas-price-fetcher';
import { restore, stub } from 'sinon';
import { GasPriceFetcher } from '../../../../src/shared/infrastructure/gas-price-fetcher';
import { createMock } from 'ts-auto-mock';
import { IGasPriceFetcher } from '../../../../src/shared/domain/gas-price-fetcher';
import { method, On } from 'ts-auto-mock/extension';

describe('cached-gas-price-fetcher', () => {
  afterEach(() => {
    restore();
  });

  it('should only request gas one time when same arguments', async () => {
    // Arrange
    const fetcherMock = createMock<IGasPriceFetcher>();
    stub(GasPriceFetcher, 'create').returns(fetcherMock);
    const cachedFetcher = new CachedGasPriceFetcher();
    const fetchSpy = On(fetcherMock).get(method((mock) => mock.fetch));

    // Act
    await cachedFetcher.fetch('1');
    await cachedFetcher.fetch('1');

    // Assert
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('should only request gas one time when different arguments', async () => {
    // Arrange
    const fetcherMock = createMock<IGasPriceFetcher>();
    stub(GasPriceFetcher, 'create').returns(fetcherMock);
    const cachedFetcher = new CachedGasPriceFetcher();
    const fetchSpy = On(fetcherMock).get(method((mock) => mock.fetch));

    // Act
    await cachedFetcher.fetch('1');
    await cachedFetcher.fetch('2');

    // Assert
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
