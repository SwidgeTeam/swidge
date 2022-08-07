import { SinonStub, SinonStubStatic, stub } from 'sinon';
import { ZeroEx } from '../../../../src/swaps/domain/providers/zero-ex';
import { SwapOrderComputer } from '../../../../src/swaps/application/query/swap-order-computer';
import { PathComputer } from '../../../../src/paths/domain/path-computer';
import { HttpClient } from '../../../../src/shared/infrastructure/http/httpClient';
import { CachedHttpClient } from '../../../../src/shared/infrastructure/http/cachedHttpClient';
import { BridgeOrderComputer } from '../../../../src/bridges/application/query/bridge-order-computer';
import { TokenDetailsFetcher } from '../../../../src/shared/infrastructure/TokenDetailsFetcher';
import { GetPathQuery } from '../../../../src/paths/application/query/get-path.query';
import { TokenMother } from '../../shared/domain/Token.mother';
import { SwapOrder } from '../../../../src/swaps/domain/SwapOrder';
import { ExchangeProviders } from '../../../../src/swaps/domain/providers/exchange-providers';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';
import { BigNumber } from 'ethers';
import { Multichain } from '../../../../src/bridges/domain/providers/multichain';
import { BridgingOrder } from '../../../../src/bridges/domain/bridging-order';
import { BridgingFees } from '../../../../src/bridges/domain/BridgingFees';
import { BridgingLimits } from '../../../../src/bridges/domain/BridgingLimits';
import { Tokens } from '../../../../src/shared/enums/Tokens';
import { Fantom, Polygon } from '../../../../src/shared/enums/ChainIds';
import { createMock } from 'ts-auto-mock';
import { SushiPairsRepository } from '../../../../src/swaps/domain/sushi-pairs-repository';
import { PriceFeedFetcher } from '../../../../src/shared/infrastructure/PriceFeedFetcher';
import { GasPriceFetcher } from '../../../../src/shared/infrastructure/GasPriceFetcher';
import { Sushiswap } from '../../../../src/swaps/domain/providers/sushiswap';
import { PriceFeed } from '../../../../src/shared/domain/PriceFeed';
import { AggregatorOrderComputer } from '../../../../src/aggregators/application/query/aggregator-order-computer';

describe('path-computer', () => {
  it('should compute a single path', async () => {
    /** Arrange */
    // Tokens
    const srcToken = TokenMother.link();
    const dstToken = TokenMother.sushi();
    const bridgeTokenIn = Tokens.USDC[Polygon];
    const bridgeTokenOut = Tokens.USDC[Fantom];

    const fetcher = new TokenDetailsFetcher();
    const mockTokenFetcher = stub(fetcher, 'fetch');
    mockTokenFetcher.onCall(0).resolves(srcToken);
    mockTokenFetcher.onCall(1).resolves(dstToken);

    const myHttpClient = HttpClient.create();
    const myCachedHttpClient = CachedHttpClient.create();

    // mock both calls of ZeroEx provider
    const zeroExStub = getZeroEx(srcToken, bridgeTokenIn, bridgeTokenOut, dstToken);

    // mock Multichain bridge provider
    const multichainStub = getMultichain(bridgeTokenIn, bridgeTokenOut);

    const mockSushiRepository = createMock<SushiPairsRepository>({
      getPairs: (chainId) => Promise.reject([]),
    });

    const sushiStub = getSushi(srcToken, bridgeTokenIn, bridgeTokenOut, dstToken);

    // mock GasPriceFetcher
    const gasPriceFetcher = new GasPriceFetcher();
    stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('100000000'));

    const priceFeedFetcher = getPriceFeedFetcher([
      { chain: Polygon, result: '500' },
      { chain: Fantom, result: '1500' },
    ]);

    // instantiate dependencies
    const swapOrderComputer = new SwapOrderComputer(
      myHttpClient,
      myCachedHttpClient,
      mockSushiRepository,
    );
    const bridgeOrderComputer = new BridgeOrderComputer(myHttpClient, myCachedHttpClient);
    const aggregatorOrderComputer = new AggregatorOrderComputer(myHttpClient);

    // create computer
    const pathComputer = new PathComputer(
      swapOrderComputer,
      bridgeOrderComputer,
      aggregatorOrderComputer,
      fetcher,
      priceFeedFetcher,
      gasPriceFetcher,
    );

    // create pat query
    const query = new GetPathQuery(Polygon, Fantom, '0xLINK', '0xSUSHI', '1000000000000000000');

    /** Act */
    const path = await pathComputer.compute(query);

    /** Assert */
    expect(zeroExStub.callCount).toEqual(2);
    expect(sushiStub.callCount).toEqual(2);
    expect(multichainStub.callCount).toEqual(2);
    expect(path.destinationFeeInOriginWei.toString()).toEqual('3333333333333');
  });
});

function getSushi(srcToken, bridgeTokenIn, bridgeTokenOut, dstToken): SinonStub {
  const myHttpClient = HttpClient.create();
  const mockSushiRepository = createMock<SushiPairsRepository>({
    getPairs: (chainId) => Promise.reject([]),
  });
  const sushi = new Sushiswap(myHttpClient, mockSushiRepository);
  const sushiStub = stub(sushi, 'execute')
    .onCall(0)
    .resolves(
      new SwapOrder(
        ExchangeProviders.Sushi,
        srcToken,
        bridgeTokenIn,
        '',
        '',
        BigInteger.fromDecimal('2', srcToken.decimals),
        BigInteger.fromString('0'),
      ),
    )
    .onCall(1)
    .resolves(
      new SwapOrder(
        ExchangeProviders.Sushi,
        bridgeTokenOut,
        dstToken,
        '',
        '',
        BigInteger.fromDecimal('2', srcToken.decimals),
        BigInteger.fromString('100000'),
      ),
    );

  stub(sushi, 'isEnabledOn').returns(true);
  stub(Sushiswap, 'create').returns(sushi);

  return sushiStub;
}

function getZeroEx(srcToken, bridgeTokenIn, bridgeTokenOut, dstToken): SinonStub {
  const myHttpClient = HttpClient.create();
  const zeroEx = new ZeroEx(myHttpClient);
  const zeroExStub = stub(zeroEx, 'execute')
    .onCall(0)
    .resolves(
      new SwapOrder(
        ExchangeProviders.ZeroEx,
        srcToken,
        bridgeTokenIn,
        '',
        '',
        BigInteger.fromDecimal('2', srcToken.decimals),
        BigInteger.fromString('0'),
      ),
    )
    .onCall(1)
    .resolves(
      new SwapOrder(
        ExchangeProviders.ZeroEx,
        bridgeTokenOut,
        dstToken,
        '',
        '',
        BigInteger.fromDecimal('2', srcToken.decimals),
        BigInteger.fromString('100000'),
      ),
    );
  stub(zeroEx, 'isEnabledOn').returns(true);
  stub(ZeroEx, 'create').returns(zeroEx);

  return zeroExStub;
}

function getMultichain(bridgeTokenIn, bridgeTokenOut): SinonStub {
  const myCachedHttpClient = CachedHttpClient.create();
  const multichain = new Multichain(myCachedHttpClient);
  const multichainStub = stub(multichain, 'execute')
    .onCall(0)
    .resolves(
      new BridgingOrder(
        BigInteger.zero(),
        bridgeTokenIn,
        bridgeTokenOut,
        Fantom,
        '',
        new BridgingFees(0, BigInteger.fromDecimal('0'), BigInteger.fromDecimal('0'), 18),
        new BridgingLimits(
          BigInteger.fromDecimal('0'),
          BigInteger.fromDecimal('0'),
          BigInteger.fromDecimal('0'),
          18,
        ),
        true,
      ),
    );
  stub(multichain, 'isEnabledOn').returns(true);
  stub(Multichain, 'create').returns(multichain);

  return multichainStub;
}

function getPriceFeedFetcher(responses: { chain: string; result: string }[]) {
  const priceFeedFetcher = new PriceFeedFetcher();
  const fetcherStub = stub(priceFeedFetcher, 'fetch');
  for (const response of responses) {
    const priceFeed = new PriceFeed(BigInteger.fromString(response.result), 8);
    fetcherStub.withArgs(response.chain).resolves(priceFeed);
  }
  return priceFeedFetcher;
}
