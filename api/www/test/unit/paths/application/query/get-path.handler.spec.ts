import { GetPathHandler } from '../../../../../src/paths/application/query/get-path.handler';
import { GetPathQuery } from '../../../../../src/paths/application/query/get-path.query';
import { createMock } from 'ts-auto-mock';
import { SwapOrderComputer } from '../../../../../src/swaps/application/query/swap-order-computer';
import { BridgeOrderComputer } from '../../../../../src/bridges/application/query/bridge-order-computer';
import { Token } from '../../../../../src/shared/domain/Token';
import { InsufficientLiquidity } from '../../../../../src/swaps/domain/InsufficientLiquidity';
import { TokenDetailsFetcher } from '../../../../../src/shared/infrastructure/TokenDetailsFetcher';
import { PriceFeedConverter } from '../../../../../src/shared/infrastructure/PriceFeedConverter';
import { BigNumber } from 'ethers';

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
    const mockPriceFeedConverter = createMock<PriceFeedConverter>({
      fetch: () => {
        return Promise.resolve(BigNumber.from(0));
      },
    });

    const handler = new GetPathHandler(
      mockSwapProvider,
      mockBridgeProvider,
      mockTokenDetailsFetcher,
      mockPriceFeedConverter,
    );

    const query = new GetPathQuery('137', '250', '0xtokenA', '0xtokenB', '10');

    // Assert
    await expect(handler.execute(query)).rejects.toThrow('PATH_NOT_FOUND');
  });
});
