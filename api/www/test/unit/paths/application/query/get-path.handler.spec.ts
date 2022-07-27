import { GetPathHandler } from '../../../../../src/paths/application/query/get-path.handler';
import { GetPathQuery } from '../../../../../src/paths/application/query/get-path.query';
import { createMock } from 'ts-auto-mock';
import { SwapOrderComputer } from '../../../../../src/swaps/application/query/swap-order-computer';
import { BridgeOrderComputer } from '../../../../../src/bridges/application/query/bridge-order-computer';
import { Token } from '../../../../../src/shared/domain/Token';
import { InsufficientLiquidity } from '../../../../../src/swaps/domain/InsufficientLiquidity';
import { TokenDetailsFetcher } from '../../../../../src/shared/infrastructure/TokenDetailsFetcher';
import { BigNumber } from 'ethers';
import { PriceFeedFetcher } from '../../../../../src/shared/infrastructure/PriceFeedFetcher';
import { stub } from 'sinon';
import { GasPriceFetcher } from '../../../../../src/shared/infrastructure/GasPriceFetcher';

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
    const mockTokenDetailsFetcher = createMock<TokenDetailsFetcher>({
      fetch: () => {
        return Promise.resolve(new Token('', '', 6, 'SYMB'));
      },
    });

    const priceFeedFetcher = new PriceFeedFetcher();
    stub(priceFeedFetcher, 'fetch')
      .onCall(0)
      .resolves(BigNumber.from('101010'))
      .onCall(1)
      .resolves(BigNumber.from('101010'));

    // mock GasPriceFetcher
    const gasPriceFetcher = new GasPriceFetcher();
    stub(gasPriceFetcher, 'fetch').resolves(BigNumber.from('101010'));

    const handler = new GetPathHandler(
      mockSwapProvider,
      mockBridgeProvider,
      mockTokenDetailsFetcher,
      priceFeedFetcher,
      gasPriceFetcher,
    );

    const query = new GetPathQuery('137', '250', '0xtokenA', '0xtokenB', '10');

    // Assert
    await expect(handler.execute(query)).rejects.toThrow('PATH_NOT_FOUND');
  });
});
