import { stub } from 'sinon';
import { createMock } from 'ts-auto-mock';
import { ZeroEx } from '../../../../src/swaps/domain/providers/zero-ex';
import { PathComputer } from '../../../../src/paths/domain/path-computer';
import { GetPathQuery } from '../../../../src/paths/application/query/get-path.query';
import { TokenMother } from '../../shared/domain/token.mother';
import { BigInteger } from '../../../../src/shared/domain/big-integer';
import { Polygon } from '../../../../src/shared/enums/ChainIds';
import { GasPriceFetcher } from '../../../../src/shared/infrastructure/gas-price-fetcher';
import { Sushiswap } from '../../../../src/swaps/domain/providers/sushiswap';
import { Exchanges } from '../../../../src/swaps/domain/exchanges';
import { Aggregators } from '../../../../src/aggregators/domain/aggregators';
import { Bridges } from '../../../../src/bridges/domain/bridges';
import { ExchangeProviders } from '../../../../src/swaps/domain/providers/exchange-providers';
import { getPriceFeedFetcher, getTokenDetailsFetcher, loggerMock } from '../../shared/shared';
import { SwapOrderMother } from '../../swaps/domain/swap-order.mother';
import { faker } from '@faker-js/faker';
import { DeployedAddresses } from '../../../../src/shared/DeployedAddresses';

describe('path-computer - single chain', () => {
  describe('path-computer - no routes', () => {
    it('should throw no-path when swap not available', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();

      const fetcher = getTokenDetailsFetcher([srcToken, dstToken]);

      // mock ZeroEx provider
      const mockZeroEx = createMock<ZeroEx>({
        execute: () => Promise.reject('no route'),
        isEnabledOn: () => true,
      });

      // mock Sushi provider
      const mockSushi = createMock<Sushiswap>({
        execute: () => Promise.reject('no route'),
        isEnabledOn: () => true,
      });

      const exchanges = new Exchanges([
        [ExchangeProviders.ZeroEx, mockZeroEx],
        [ExchangeProviders.Sushi, mockSushi],
      ]);

      // mock GasPriceFetcher
      const gasPriceFetcher = new GasPriceFetcher();
      stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

      // mock PriceFeedFetcher
      const priceFeedFetcher = getPriceFeedFetcher([{ chain: Polygon, result: '500' }]);

      // create computer
      const pathComputer = new PathComputer(
        exchanges,
        new Bridges([]),
        fetcher,
        priceFeedFetcher,
        gasPriceFetcher,
        loggerMock(),
      );

      // create pat query
      const query = getPathQuery();

      /** Act */
      const computeCall = pathComputer.compute(query);

      /** Assert */
      await expect(computeCall).rejects.toEqual(new Error('PATH_NOT_FOUND'));
    });
  });

  describe('path-computer - with routes', () => {
    it('should compute two different routes', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();

      const fetcher = getTokenDetailsFetcher([srcToken, dstToken]);

      // mock ZeroEx provider
      const mockZeroEx = createMock<ZeroEx>({
        execute: (request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '2'),
          );
        },
        isEnabledOn: () => true,
      });

      // mock Sushi provider
      const mockSushi = createMock<Sushiswap>({
        execute: (request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.Sushi, request, '4'),
          );
        },
        isEnabledOn: () => true,
      });

      const exchanges = new Exchanges([
        [ExchangeProviders.ZeroEx, mockZeroEx],
        [ExchangeProviders.Sushi, mockSushi],
      ]);

      // mock GasPriceFetcher
      const gasPriceFetcher = new GasPriceFetcher();
      stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

      // mock PriceFeedFetcher
      const priceFeedFetcher = getPriceFeedFetcher([{ chain: Polygon, result: '500' }]);

      // create computer
      const pathComputer = new PathComputer(
        exchanges,
        new Bridges([]),
        fetcher,
        priceFeedFetcher,
        gasPriceFetcher,
        loggerMock(),
      );

      // create pat query
      const query = getPathQuery();

      /** Act */
      const routes = await pathComputer.compute(query);

      /** Assert */
      expect(routes.length).toEqual(2);

      expect(routes[0].resume.fromToken).toEqual(srcToken);
      expect(routes[0].resume.toToken).toEqual(dstToken);
      expect(routes[0].approvalTransaction.to).toEqual(srcToken.address);
      expect(routes[0].transaction.to).toEqual(DeployedAddresses.Router);
      expect(routes[0].resume.amountIn).toEqual(BigInteger.fromDecimal('1000', srcToken.decimals));
      expect(routes[0].amountOut).toEqual('2.0');

      expect(routes[1].resume.fromToken).toEqual(srcToken);
      expect(routes[1].resume.toToken).toEqual(dstToken);
      expect(routes[1].approvalTransaction.to).toEqual(srcToken.address);
      expect(routes[1].transaction.to).toEqual(DeployedAddresses.Router);
      expect(routes[1].resume.amountIn).toEqual(BigInteger.fromDecimal('1000', srcToken.decimals));
      expect(routes[1].amountOut).toEqual('4.0');
    });

    it('should compute route without approval if native token in', async () => {
      /** Arrange */
      const srcToken = TokenMother.polygonMatic();
      const dstToken = TokenMother.sushi();

      const fetcher = getTokenDetailsFetcher([srcToken, dstToken]);

      // mock ZeroEx provider
      const mockZeroEx = createMock<ZeroEx>({
        execute: (request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '2'),
          );
        },
        isEnabledOn: () => true,
      });

      const exchanges = new Exchanges([[ExchangeProviders.ZeroEx, mockZeroEx]]);

      // mock GasPriceFetcher
      const gasPriceFetcher = new GasPriceFetcher();
      stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

      // mock PriceFeedFetcher
      const priceFeedFetcher = getPriceFeedFetcher([{ chain: Polygon, result: '500' }]);

      // create computer
      const pathComputer = new PathComputer(
        exchanges,
        new Bridges([]),
        fetcher,
        priceFeedFetcher,
        gasPriceFetcher,
        loggerMock(),
      );

      // create pat query
      const query = new GetPathQuery(
        TokenMother.polygonMatic(),
        TokenMother.sushi(),
        '1000',
        2,
        faker.finance.ethereumAddress(),
        faker.finance.ethereumAddress(),
      );

      /** Act */
      const routes = await pathComputer.compute(query);

      /** Assert */
      expect(routes.length).toEqual(1);

      expect(routes[0].resume.fromToken).toEqual(srcToken);
      expect(routes[0].resume.toToken).toEqual(dstToken);
      expect(routes[0].approvalTransaction).toEqual(null);
      expect(routes[0].transaction.to).toEqual(DeployedAddresses.Router);
      expect(routes[0].resume.amountIn).toEqual(BigInteger.fromDecimal('1000', srcToken.decimals));
      expect(routes[0].amountOut).toEqual('2.0');
    });
  });
});

function getPathQuery(): GetPathQuery {
  return new GetPathQuery(
    TokenMother.link(),
    TokenMother.sushi(),
    '1000',
    2,
    faker.finance.ethereumAddress(),
    faker.finance.ethereumAddress(),
  );
}
