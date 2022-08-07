import { GetPathHandler } from '../../../../../src/paths/application/query/get-path.handler';
import { GetPathQuery } from '../../../../../src/paths/application/query/get-path.query';
import { createMock } from 'ts-auto-mock';
import { SwapOrderComputer } from '../../../../../src/swaps/application/query/swap-order-computer';
import { BridgeOrderComputer } from '../../../../../src/bridges/application/query/bridge-order-computer';
import { Token } from '../../../../../src/shared/domain/Token';
import { InsufficientLiquidity } from '../../../../../src/swaps/domain/InsufficientLiquidity';
import { TokenDetailsFetcher } from '../../../../../src/shared/infrastructure/TokenDetailsFetcher';
import { PriceFeedFetcher } from '../../../../../src/shared/infrastructure/PriceFeedFetcher';
import { stub } from 'sinon';
import { GasPriceFetcher } from '../../../../../src/shared/infrastructure/GasPriceFetcher';
import { BigInteger } from '../../../../../src/shared/domain/BigInteger';
import { PriceFeed } from '../../../../../src/shared/domain/PriceFeed';
import { Fantom, Polygon } from '../../../../../src/shared/enums/ChainIds';
import { AggregatorOrderComputer } from '../../../../../src/aggregators/application/query/aggregator-order-computer';

describe('get path', () => {
  it('should return error if invalid first swap', async () => {
    // Arrange
    const mockSwapProvider = createMock<SwapOrderComputer>({
      execute: () => Promise.reject(new InsufficientLiquidity()),
      getEnabledExchanged: () => [1],
    });
    const mockBridgeProvider = createMock<BridgeOrderComputer>({
      execute: () => null,
    });
    const mockAggregatorProvider = createMock<AggregatorOrderComputer>({
      execute: () => null,
    });
    const mockTokenDetailsFetcher = createMock<TokenDetailsFetcher>({
      fetch: () => {
        return Promise.resolve(new Token('', '', 6, 'SYMB'));
      },
    });

    const priceFeedFetcher = getPriceFeedFetcher([
      { chain: Polygon, result: '500' },
      { chain: Fantom, result: '1500' },
    ]);

    // mock GasPriceFetcher
    const gasPriceFetcher = new GasPriceFetcher();
    stub(gasPriceFetcher, 'fetch').resolves(BigInteger.fromString('101010'));

    const handler = new GetPathHandler(
      mockSwapProvider,
      mockBridgeProvider,
      mockAggregatorProvider,
      mockTokenDetailsFetcher,
      priceFeedFetcher,
      gasPriceFetcher,
    );

    const query = new GetPathQuery('137', '250', '0xtokenA', '0xtokenB', '10');

    // Assert
    await expect(handler.execute(query)).rejects.toThrow('PATH_NOT_FOUND');
  });
});

function getPriceFeedFetcher(responses: { chain: string; result: string }[]) {
  const priceFeedFetcher = new PriceFeedFetcher();
  const fetcherStub = stub(priceFeedFetcher, 'fetch');
  for (const response of responses) {
    const priceFeed = new PriceFeed(BigInteger.fromString(response.result), 8);
    fetcherStub.withArgs(response.chain).resolves(priceFeed);
  }
  return priceFeedFetcher;
}
