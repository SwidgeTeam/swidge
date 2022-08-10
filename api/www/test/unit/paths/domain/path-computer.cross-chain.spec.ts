import { stub } from 'sinon';
import { createMock } from 'ts-auto-mock';
import { ZeroEx } from '../../../../src/swaps/domain/providers/zero-ex';
import { PathComputer } from '../../../../src/paths/domain/path-computer';
import { TokenDetailsFetcher } from '../../../../src/shared/infrastructure/TokenDetailsFetcher';
import { GetPathQuery } from '../../../../src/paths/application/query/get-path.query';
import { TokenMother } from '../../shared/domain/Token.mother';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { Polygon, Fantom } from '../../../../src/shared/enums/ChainIds';
import { GasPriceFetcher } from '../../../../src/shared/infrastructure/GasPriceFetcher';
import { Sushiswap } from '../../../../src/swaps/domain/providers/sushiswap';
import { Exchanges } from '../../../../src/swaps/domain/exchanges';
import { Aggregators } from '../../../../src/aggregators/domain/aggregators';
import { Bridges } from '../../../../src/bridges/domain/bridges';
import { SwapOrder } from '../../../../src/swaps/domain/SwapOrder';
import { ExchangeProviders } from '../../../../src/swaps/domain/providers/exchange-providers';
import { BridgingOrder } from '../../../../src/bridges/domain/bridging-order';
import { BridgingFeesMother } from '../../bridges/domain/bridging-fees.mother';
import { BridgingLimitsMother } from '../../bridges/domain/bridging-limits.mother';
import { Tokens } from '../../../../src/shared/enums/Tokens';
import { Multichain } from '../../../../src/bridges/domain/providers/multichain';
import { BridgeProviders } from '../../../../src/bridges/domain/providers/bridge-providers';
import { getPriceFeedFetcher, getSushi, getZeroEx } from '../../shared/shared';

describe('path-computer - cross chain', () => {
  describe('path-computer - no routes', () => {
    it('should throw no-path when cross chain origin swap not available', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();

      const fetcher = new TokenDetailsFetcher();
      const mockTokenFetcher = stub(fetcher, 'fetch');
      mockTokenFetcher.onCall(0).resolves(srcToken);
      mockTokenFetcher.onCall(1).resolves(dstToken);

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
          return Promise.resolve(
            new BridgingOrder(
              request.amount,
              request.tokenIn,
              TokenMother.random(),
              request.toChainId,
              '0x',
              BridgingFeesMother.random(),
              BridgingLimitsMother.random(),
            ),
          );
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
        new Aggregators([]),
        fetcher,
        priceFeedFetcher,
        gasPriceFetcher,
      );

      // create pat query
      const query = new GetPathQuery(Polygon, Fantom, '0xLINK', '0xSUSHI', '1000');

      /** Act */
      const computeCall = pathComputer.compute(query);

      /** Assert */
      await expect(computeCall).rejects.toEqual(new Error('PATH_NOT_FOUND'));
    });

    it('should throw no-path when cross chain bridge not available', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();

      const fetcher = new TokenDetailsFetcher();
      const mockTokenFetcher = stub(fetcher, 'fetch');
      mockTokenFetcher.onCall(0).resolves(srcToken);
      mockTokenFetcher.onCall(1).resolves(dstToken);

      // mock Sushi provider
      const mockSushi = createMock<Sushiswap>({
        execute: (request) =>
          Promise.reject(
            new SwapOrder(
              ExchangeProviders.Sushi,
              request.tokenIn,
              TokenMother.random(),
              '0x',
              request.amountIn,
              BigInteger.fromDecimal('2', srcToken.decimals),
              BigInteger.fromString('0'),
            ),
          ),
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
        new Aggregators([]),
        fetcher,
        priceFeedFetcher,
        gasPriceFetcher,
      );

      // create pat query
      const query = new GetPathQuery(Polygon, Fantom, '0xLINK', '0xSUSHI', '1000');

      /** Act */
      const computeCall = pathComputer.compute(query);

      /** Assert */
      await expect(computeCall).rejects.toEqual(new Error('PATH_NOT_FOUND'));
    });

    it('should throw no-path when cross chain destination swap not available', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();

      const fetcher = new TokenDetailsFetcher();
      const mockTokenFetcher = stub(fetcher, 'fetch');
      mockTokenFetcher.onCall(0).resolves(srcToken);
      mockTokenFetcher.onCall(1).resolves(dstToken);

      // mock Sushi provider
      const mockZeroEx = getZeroEx();
      stub(mockZeroEx, 'isEnabledOn').returns(true);
      stub(mockZeroEx, 'execute')
        .onCall(0)
        .callsFake((request) => {
          return Promise.resolve(
            new SwapOrder(
              ExchangeProviders.ZeroEx,
              request.tokenIn,
              TokenMother.random(),
              '0x',
              request.amountIn,
              BigInteger.fromDecimal('2', srcToken.decimals),
              BigInteger.fromString('0'),
            ),
          );
        })
        .onCall(1)
        .rejects('no swap');

      // mock Multichain bridge provider
      const mockMultichain = createMock<Multichain>({
        execute: (request) => {
          return Promise.resolve(
            new BridgingOrder(
              request.amount,
              request.tokenIn,
              TokenMother.random(),
              request.toChainId,
              '0x',
              BridgingFeesMother.random(),
              BridgingLimitsMother.random(),
            ),
          );
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
        new Aggregators([]),
        fetcher,
        priceFeedFetcher,
        gasPriceFetcher,
      );

      // create pat query
      const query = new GetPathQuery(Polygon, Fantom, '0xLINK', '0xSUSHI', '1000');

      /** Act */
      const computeCall = pathComputer.compute(query);

      /** Assert */
      await expect(computeCall).rejects.toEqual(new Error('PATH_NOT_FOUND'));
    });
  });

  describe('path-computer - with routes', () => {
    it('should compute one cross chain route', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();
      const bridgeTokenIn = Tokens.USDC[Polygon];
      const bridgeTokenOut = Tokens.USDC[Fantom];

      const fetcher = new TokenDetailsFetcher();
      const mockTokenFetcher = stub(fetcher, 'fetch');
      mockTokenFetcher.onCall(0).resolves(srcToken);
      mockTokenFetcher.onCall(1).resolves(dstToken);

      // mock ZeroEx provider

      const mockZeroEx = getZeroEx();
      stub(mockZeroEx, 'isEnabledOn').returns(true);
      stub(mockZeroEx, 'execute')
        .onCall(0)
        .callsFake((request) => {
          return Promise.resolve(
            new SwapOrder(
              ExchangeProviders.ZeroEx,
              request.tokenIn,
              bridgeTokenIn,
              '0x',
              request.amountIn,
              BigInteger.fromDecimal('2', srcToken.decimals),
              BigInteger.fromString('0'),
            ),
          );
        })
        .onCall(1)
        .callsFake((request) => {
          return Promise.resolve(
            new SwapOrder(
              ExchangeProviders.ZeroEx,
              request.tokenIn,
              dstToken,
              '0x',
              request.amountIn,
              BigInteger.fromDecimal('60', srcToken.decimals),
              BigInteger.fromString('0'),
            ),
          );
        });

      // mock Multichain bridge provider
      const mockMultichain = createMock<Multichain>({
        execute: (request) => {
          return Promise.resolve(
            new BridgingOrder(
              request.amount,
              request.tokenIn,
              bridgeTokenOut,
              request.toChainId,
              '0x',
              BridgingFeesMother.random(),
              BridgingLimitsMother.random(),
            ),
          );
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
        new Aggregators([]),
        fetcher,
        priceFeedFetcher,
        gasPriceFetcher,
      );

      // create pat query
      const query = new GetPathQuery(Polygon, Fantom, '0xLINK', '0xSUSHI', '1000');

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

    it('should compute four cross chain routes', async () => {
      /** Arrange */
      const srcToken = TokenMother.link();
      const dstToken = TokenMother.sushi();
      const bridgeTokenIn = TokenMother.random();
      const bridgeTokenOut = TokenMother.random();

      const fetcher = new TokenDetailsFetcher();
      const mockTokenFetcher = stub(fetcher, 'fetch');
      mockTokenFetcher.onCall(0).resolves(srcToken);
      mockTokenFetcher.onCall(1).resolves(dstToken);

      // mock ZeroEx provider
      const mockZeroEx = getZeroEx();
      stub(mockZeroEx, 'isEnabledOn').returns(true);
      stub(mockZeroEx, 'execute')
        .onCall(0) // origin swap
        .callsFake((request) => {
          return Promise.resolve(
            new SwapOrder(
              ExchangeProviders.ZeroEx,
              request.tokenIn,
              bridgeTokenIn,
              '0x',
              request.amountIn,
              BigInteger.fromDecimal('1', srcToken.decimals),
              BigInteger.fromString('0'),
            ),
          );
        })
        .onCall(1) // destination swap coming from provider one
        .callsFake((request) => {
          return Promise.resolve(
            new SwapOrder(
              ExchangeProviders.ZeroEx,
              request.tokenIn,
              dstToken,
              '0x',
              request.amountIn,
              BigInteger.fromDecimal('30', srcToken.decimals),
              BigInteger.fromString('0'),
            ),
          );
        })
        .onCall(2) // destination swap coming from provider two
        .callsFake((request) => {
          return Promise.resolve(
            new SwapOrder(
              ExchangeProviders.ZeroEx,
              request.tokenIn,
              dstToken,
              '0x',
              request.amountIn,
              BigInteger.fromDecimal('40', srcToken.decimals),
              BigInteger.fromString('0'),
            ),
          );
        });

      // mock Sushi provider
      const mockSushi = getSushi();
      stub(mockSushi, 'isEnabledOn').returns(true);
      stub(mockSushi, 'execute')
        .onCall(0) // origin swap
        .callsFake((request) => {
          return Promise.resolve(
            new SwapOrder(
              ExchangeProviders.Sushi,
              request.tokenIn,
              bridgeTokenIn,
              '0x',
              request.amountIn,
              BigInteger.fromDecimal('2', srcToken.decimals),
              BigInteger.fromString('0'),
            ),
          );
        })
        .onCall(1) // destination swap coming from provider one
        .callsFake((request) => {
          return Promise.resolve(
            new SwapOrder(
              ExchangeProviders.Sushi,
              request.tokenIn,
              dstToken,
              '0x',
              request.amountIn,
              BigInteger.fromDecimal('50', srcToken.decimals),
              BigInteger.fromString('0'),
            ),
          );
        })
        .onCall(2) // destination swap coming from provider two
        .callsFake((request) => {
          return Promise.resolve(
            new SwapOrder(
              ExchangeProviders.Sushi,
              request.tokenIn,
              dstToken,
              '0x',
              request.amountIn,
              BigInteger.fromDecimal('60', srcToken.decimals),
              BigInteger.fromString('0'),
            ),
          );
        });

      // mock Multichain bridge provider
      const mockMultichain = createMock<Multichain>({
        execute: (request) => {
          return Promise.resolve(
            new BridgingOrder(
              request.amount,
              request.tokenIn,
              bridgeTokenOut,
              request.toChainId,
              '0x',
              BridgingFeesMother.random(),
              BridgingLimitsMother.random(),
            ),
          );
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
        new Aggregators([]),
        fetcher,
        priceFeedFetcher,
        gasPriceFetcher,
      );

      // create pat query
      const query = new GetPathQuery(Polygon, Fantom, '0xLINK', '0xSUSHI', '1000');

      /** Act */
      const routes = await pathComputer.compute(query);

      /** Assert */
      expect(routes.length).toEqual(4);
    });
  });
});
