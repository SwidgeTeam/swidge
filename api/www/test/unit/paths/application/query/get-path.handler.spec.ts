import { GetPathHandler } from '../../../../../src/paths/application/query/get-path.handler';
import { GetPathQuery } from '../../../../../src/paths/application/query/get-path.query';
import { createMock } from 'ts-auto-mock';
import { GetSwapOrder } from '../../../../../src/swaps/application/query/get-swap-order';
import { GetBridgingOrder } from '../../../../../src/bridges/application/query/get-bridging-order';
import { Token } from '../../../../../src/shared/domain/Token';
import { RouterAddressFetcher } from '../../../../../src/addresses/application/query/RouterAddressFetcher';
import { InsufficientLiquidity } from '../../../../../src/swaps/domain/InsufficientLiquidity';
import { TokenDetailsFetcher } from '../../../../../src/shared/infrastructure/TokenDetailsFetcher';
import { PriceFeedConverter } from '../../../../../src/shared/infrastructure/PriceFeedConverter';
import { BigNumber } from 'ethers';

describe('get path', () => {
  it('should return error if invalid first swap', async () => {
    // Arrange
    const mockRouterFetcher = createMock<RouterAddressFetcher>({
      getAddress: () => Promise.resolve('0xRouter'),
    });
    const mockSwapProvider = createMock<GetSwapOrder>({
      execute: () => Promise.reject(new InsufficientLiquidity()),
    });
    const mockBridgeProvider = createMock<GetBridgingOrder>({
      execute: () => null,
    });
    const mockTokenDetailsFetcher = createMock<TokenDetailsFetcher>({
      fetch: () => {
        return Promise.resolve(new Token('', '', 6));
      },
    });
    const mockPriceFeedConverter = createMock<PriceFeedConverter>({
      fetch: () => {
        return Promise.resolve(BigNumber.from(0));
      },
    });

    const handler = new GetPathHandler(
      mockRouterFetcher,
      mockSwapProvider,
      mockBridgeProvider,
      mockTokenDetailsFetcher,
      mockPriceFeedConverter,
    );

    const query = new GetPathQuery('137', '250', '0xtokenA', '0xtokenB', '10');

    // Assert
    await expect(handler.execute(query)).rejects.toThrow(
      'INSUFFICIENT_LIQUIDITY',
    );
  });
});
