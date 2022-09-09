import { stub } from 'sinon';
import { createMock } from 'ts-auto-mock';
import { ZeroEx } from '../../../../src/swaps/domain/providers/zero-ex';
import { PathComputer } from '../../../../src/paths/domain/path-computer';
import { GetPathQuery } from '../../../../src/paths/application/query/get-path.query';
import { TokenMother } from '../../shared/domain/token.mother';
import { BigInteger } from '../../../../src/shared/domain/big-integer';
import { Polygon, Fantom } from '../../../../src/shared/enums/ChainIds';
import { GasPriceFetcher } from '../../../../src/shared/infrastructure/gas-price-fetcher';
import { Sushiswap } from '../../../../src/swaps/domain/providers/sushiswap';
import { Exchanges } from '../../../../src/swaps/domain/exchanges';
import { Aggregators } from '../../../../src/aggregators/domain/aggregators';
import { Bridges } from '../../../../src/bridges/domain/bridges';
import { SwapOrder } from '../../../../src/swaps/domain/swap-order';
import { ExchangeProviders } from '../../../../src/swaps/domain/providers/exchange-providers';
import { Tokens } from '../../../../src/shared/enums/Tokens';
import { Multichain } from '../../../../src/bridges/domain/providers/multichain';
import { BridgeProviders } from '../../../../src/bridges/domain/providers/bridge-providers';
import {
  getPriceFeedFetcher,
  getSushi,
  getTokenDetailsFetcher,
  getZeroEx, loggerMock,
} from '../../shared/shared';
import { BridgingOrderMother } from '../../bridges/domain/bridging-order.mother';
import { SwapOrderMother } from '../../swaps/domain/swap-order.mother';
import { faker } from '@faker-js/faker';

describe('path-computer - cross chain', () => {
  describe('path-computer - no routes', () => {
    it('should throw no-path when origin swap not available', async () => {
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

      // mock Multichain bridge provider
      const mockMultichain = createMock<Multichain>({
        execute: (request) => {
          return Promise.resolve(BridgingOrderMother.fromRequest(request, TokenMother.random()));
        },
        isEnabledOn: () => true,
      });

      const exchanges = new Exchanges([
        [ExchangeProviders.ZeroEx, mockZeroEx],
        [ExchangeProviders.Sushi, mockSushi],
      ]);

      const bridges = new Bridges([[BridgeProviders.Multichain, mockMultichain]]);

      // mock GasPriceFetcher
      const gasPriceFetcher = new GasPriceFetcher();
      stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

      // mock PriceFeedFetcher
      const priceFeedFetcher = getPriceFeedFetcher([
        { chain: Polygon, result: '500' },
        { chain: Fantom, result: '1500' },
      ]);

      // create computer
      const pathComputer = new PathComputer(
        exchanges,
        bridges,
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

    it('should throw no-path when bridge not available', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();

      const fetcher = getTokenDetailsFetcher([srcToken, dstToken]);

      // mock Sushi provider
      const mockSushi = createMock<Sushiswap>({
        execute: (request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.Sushi, request, '2'),
          );
        },
        isEnabledOn: () => true,
      });

      // mock Multichain bridge provider
      const mockMultichain = createMock<Multichain>({
        execute: () => Promise.reject('no bridge'),
        isEnabledOn: () => true,
      });

      const exchanges = new Exchanges([[ExchangeProviders.Sushi, mockSushi]]);

      const bridges = new Bridges([[BridgeProviders.Multichain, mockMultichain]]);

      const gasPriceFetcher = new GasPriceFetcher();
      stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

      const priceFeedFetcher = getPriceFeedFetcher([
        { chain: Polygon, result: '500' },
        { chain: Fantom, result: '1500' },
      ]);

      // create computer
      const pathComputer = new PathComputer(
        exchanges,
        bridges,
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

    it('should throw no-path when destination swap not available', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();

      const fetcher = getTokenDetailsFetcher([srcToken, dstToken]);

      // mock Sushi provider
      const mockZeroEx = getZeroEx();
      stub(mockZeroEx, 'isEnabledOn').returns(true);
      stub(mockZeroEx, 'execute')
        .onCall(0)
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '2'),
          );
        })
        .onCall(1)
        .rejects('no swap');

      // mock Multichain bridge provider
      const mockMultichain = createMock<Multichain>({
        execute: (request) => {
          return Promise.resolve(BridgingOrderMother.fromRequest(request, TokenMother.random()));
        },
        isEnabledOn: () => true,
      });

      const exchanges = new Exchanges([[ExchangeProviders.ZeroEx, mockZeroEx]]);

      const bridges = new Bridges([[BridgeProviders.Multichain, mockMultichain]]);

      // mock GasPriceFetcher
      const gasPriceFetcher = new GasPriceFetcher();
      stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

      // mock PriceFeedFetcher
      const priceFeedFetcher = getPriceFeedFetcher([
        { chain: Polygon, result: '500' },
        { chain: Fantom, result: '1500' },
      ]);

      // create computer
      const pathComputer = new PathComputer(
        exchanges,
        bridges,
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
    it('should compute one route', async () => {
      /** Arrange */
      const srcToken = TokenMother.polygonLink();
      const dstToken = TokenMother.fantomSushi();
      const bridgeTokenIn = Tokens.USDC[Polygon];
      const bridgeTokenOut = Tokens.USDC[Fantom];

      const fetcher = getTokenDetailsFetcher([srcToken, dstToken]);

      // mock ZeroEx provider

      const mockZeroEx = getZeroEx();
      stub(mockZeroEx, 'isEnabledOn').returns(true);
      stub(mockZeroEx, 'execute')
        .onCall(0)
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '2'),
          );
        })
        .onCall(1)
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '60'),
          );
        });

      // mock Multichain bridge provider
      const mockMultichain = createMock<Multichain>({
        execute: (request) => {
          return Promise.resolve(BridgingOrderMother.fromRequest(request, bridgeTokenOut));
        },
        isEnabledOn: () => true,
      });

      const exchanges = new Exchanges([[ExchangeProviders.ZeroEx, mockZeroEx]]);

      const bridges = new Bridges([[BridgeProviders.Multichain, mockMultichain]]);

      // mock GasPriceFetcher
      const gasPriceFetcher = new GasPriceFetcher();
      stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

      const priceFeedFetcher = getPriceFeedFetcher([
        { chain: Polygon, result: '500' },
        { chain: Fantom, result: '1500' },
      ]);

      // create computer
      const pathComputer = new PathComputer(
        exchanges,
        bridges,
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
      expect(routes.length).toEqual(1);

      expect(routes[0].resume.fromToken).toEqual(srcToken);
      expect(routes[0].resume.toToken).toEqual(dstToken);
      expect(routes[0].amountOut).toEqual('60.0');

      expect(routes[0].steps.length).toEqual(3);

      expect(routes[0].steps[0].tokenIn).toEqual(srcToken);
      expect(routes[0].steps[0].tokenOut).toEqual(bridgeTokenIn);

      expect(routes[0].steps[1].tokenIn).toEqual(bridgeTokenIn);
      expect(routes[0].steps[1].tokenOut).toEqual(bridgeTokenOut);

      expect(routes[0].steps[2].tokenIn).toEqual(bridgeTokenOut);
      expect(routes[0].steps[2].tokenOut).toEqual(dstToken);
    });

    it('should compute four routes', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();
      const bridgeTokenOut = TokenMother.random();

      const fetcher = getTokenDetailsFetcher([srcToken, dstToken]);

      // mock ZeroEx provider
      const mockZeroEx = getZeroEx();
      stub(mockZeroEx, 'isEnabledOn').returns(true);
      stub(mockZeroEx, 'execute')
        .onCall(0) // origin swap
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '1'),
          );
        })
        .onCall(1) // destination swap coming from provider one
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '30'),
          );
        })
        .onCall(2) // destination swap coming from provider two
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '40'),
          );
        });

      // mock Sushi provider
      const mockSushi = getSushi();
      stub(mockSushi, 'isEnabledOn').returns(true);
      stub(mockSushi, 'execute')
        .onCall(0) // origin swap
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.Sushi, request, '2'),
          );
        })
        .onCall(1) // destination swap coming from provider one
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.Sushi, request, '50'),
          );
        })
        .onCall(2) // destination swap coming from provider two
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.Sushi, request, '60'),
          );
        });

      // mock Multichain bridge provider
      const mockMultichain = createMock<Multichain>({
        execute: (request) => {
          return Promise.resolve(BridgingOrderMother.fromRequest(request, bridgeTokenOut));
        },
        isEnabledOn: () => true,
      });

      const exchanges = new Exchanges([
        [ExchangeProviders.ZeroEx, mockZeroEx],
        [ExchangeProviders.Sushi, mockSushi],
      ]);

      const bridges = new Bridges([[BridgeProviders.Multichain, mockMultichain]]);

      // mock GasPriceFetcher
      const gasPriceFetcher = new GasPriceFetcher();
      stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

      const priceFeedFetcher = getPriceFeedFetcher([
        { chain: Polygon, result: '500' },
        { chain: Fantom, result: '1500' },
      ]);

      // create computer
      const pathComputer = new PathComputer(
        exchanges,
        bridges,
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
      expect(routes.length).toEqual(4);
    });

    it('should compute two routes when last swap not required', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();
      const bridgeTokenOut = TokenMother.random();

      const fetcher = getTokenDetailsFetcher([srcToken, dstToken]);

      // mock ZeroEx provider
      const mockZeroEx = getZeroEx();
      stub(mockZeroEx, 'isEnabledOn').returns(true);
      stub(mockZeroEx, 'execute')
        .onCall(0) // origin swap
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '1'),
          );
        })
        .onCall(1) // destination swap coming from provider one
        .resolves(SwapOrder.notRequired())
        .onCall(2) // destination swap coming from provider two
        .resolves(SwapOrder.notRequired());

      // mock Sushi provider
      const mockSushi = getSushi();
      stub(mockSushi, 'isEnabledOn').returns(true);
      stub(mockSushi, 'execute')
        .onCall(0) // origin swap
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.Sushi, request, '2'),
          );
        })
        .onCall(1) // destination swap coming from provider one
        .resolves(SwapOrder.notRequired())
        .onCall(2) // destination swap coming from provider two
        .resolves(SwapOrder.notRequired());

      // mock Multichain bridge provider
      const mockMultichain = createMock<Multichain>({
        execute: (request) => {
          return Promise.resolve(BridgingOrderMother.fromRequest(request, bridgeTokenOut));
        },
        isEnabledOn: () => true,
      });

      const exchanges = new Exchanges([
        [ExchangeProviders.ZeroEx, mockZeroEx],
        [ExchangeProviders.Sushi, mockSushi],
      ]);

      const bridges = new Bridges([[BridgeProviders.Multichain, mockMultichain]]);

      // mock GasPriceFetcher
      const gasPriceFetcher = new GasPriceFetcher();
      stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

      const priceFeedFetcher = getPriceFeedFetcher([
        { chain: Polygon, result: '500' },
        { chain: Fantom, result: '1500' },
      ]);

      // create computer
      const pathComputer = new PathComputer(
        exchanges,
        bridges,
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
    });

    it('should compute two routes when missing provider on destination', async () => {
      /** Arrange */
      const srcToken = TokenMother.polygonLink();
      const dstToken = TokenMother.fantomUsdc();
      const bridgeTokenOut = TokenMother.random();

      const fetcher = getTokenDetailsFetcher([srcToken, dstToken]);

      // mock Sushi provider
      const mockSushi = getSushi();
      stub(mockSushi, 'isEnabledOn')
        .onCall(0) // origin swap
        .returns(true)
        .onCall(1) // destination swap
        .returns(false);
      stub(mockSushi, 'execute')
        .onCall(0) // origin swap
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.Sushi, request, '2'),
          );
        });

      // mock ZeroEx provider
      const mockZeroEx = getZeroEx();
      stub(mockZeroEx, 'isEnabledOn').returns(true);
      stub(mockZeroEx, 'execute')
        .onCall(0) // origin swap
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '1'),
          );
        })
        .onCall(1) // destination swap coming from provider one
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '30'),
          );
        })
        .onCall(2) // destination swap coming from provider two
        .callsFake((request) => {
          return Promise.resolve(
            SwapOrderMother.fromRequest(ExchangeProviders.ZeroEx, request, '40'),
          );
        });

      // mock Multichain bridge provider
      const mockMultichain = createMock<Multichain>({
        execute: (request) => {
          return Promise.resolve(BridgingOrderMother.fromRequest(request, bridgeTokenOut));
        },
        isEnabledOn: () => true,
      });

      const exchanges = new Exchanges([
        [ExchangeProviders.ZeroEx, mockZeroEx],
        [ExchangeProviders.Sushi, mockSushi],
      ]);

      const bridges = new Bridges([[BridgeProviders.Multichain, mockMultichain]]);

      // mock GasPriceFetcher
      const gasPriceFetcher = new GasPriceFetcher();
      stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

      const priceFeedFetcher = getPriceFeedFetcher([
        { chain: Polygon, result: '500' },
        { chain: Fantom, result: '1500' },
      ]);

      // create computer
      const pathComputer = new PathComputer(
        exchanges,
        bridges,
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

      expect(routes[0].steps[0].name).toEqual('ZeroEx');
      expect(routes[0].steps[2].name).toEqual('ZeroEx');

      expect(routes[1].steps[0].name).toEqual('Sushiswap');
      expect(routes[1].steps[2].name).toEqual('ZeroEx');
    });
  });
});

function getPathQuery(): GetPathQuery {
  return new GetPathQuery(
    TokenMother.polygonLink(),
    TokenMother.fantomSushi(),
    '1000',
    2,
    faker.finance.ethereumAddress(),
    faker.finance.ethereumAddress(),
  );
}
