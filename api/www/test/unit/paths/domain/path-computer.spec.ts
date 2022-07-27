import { stub } from 'sinon';
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
import { GasConverter } from '../../../../src/shared/domain/GasConverter';

describe('path-computer', () => {
  it('should compute a single path', async () => {
    /** Arrange */
    // Tokens
    const srcToken = TokenMother.link();
    const dstToken = TokenMother.sushi();
    const bridgeTokenIn = Tokens.USDC[Polygon];
    const bridgeTokenOut = Tokens.USDC[Fantom];

    // mock TokenDetailsFetcher
    const fetcher = new TokenDetailsFetcher();
    const mockTokenFetcher = stub(fetcher, 'fetch');
    mockTokenFetcher.onCall(0).resolves(srcToken);
    mockTokenFetcher.onCall(1).resolves(dstToken);

    // mock both calls of ZeroEx provider
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
          BigNumber.from('0'),
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
          BigNumber.from('0'),
        ),
      );
    stub(zeroEx, 'isEnabledOn').returns(true);
    stub(ZeroEx, 'create').returns(zeroEx);

    // mock Multichain bridge provider
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

    // mock GasPriceFetcher
    const gasPriceFetcher = new GasPriceFetcher();
    stub(gasPriceFetcher, 'fetch').resolves(BigNumber.from('101010'));

    // mock Chainlink's PriceFeedFetcher
    const priceFeedFetcher = new PriceFeedFetcher();
    stub(priceFeedFetcher, 'fetch').resolves(BigNumber.from('101010'));

    const mockSushiRepository = createMock<SushiPairsRepository>({
      getPairs: (chainId) => Promise.reject([]),
    });

    // instantiate dependencies
    const swapOrderComputer = new SwapOrderComputer(
      myHttpClient,
      myCachedHttpClient,
      mockSushiRepository,
    );
    const bridgeOrderComputer = new BridgeOrderComputer(myHttpClient, myCachedHttpClient);

    // create computer
    const pathComputer = new PathComputer(
      swapOrderComputer,
      bridgeOrderComputer,
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
    expect(multichainStub.callCount).toEqual(1);
    expect(path.destinationFee.toString()).toEqual('101010');
  });
});
