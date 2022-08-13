import { httpClientMock, sushiRepositoryMock } from '../../../shared/shared';
import { SwapRequest } from '../../../../../src/swaps/domain/SwapRequest';
import { Polygon } from '../../../../../src/shared/enums/ChainIds';
import { TokenMother } from '../../../shared/domain/Token.mother';
import { Sushiswap } from '../../../../../src/swaps/domain/providers/sushiswap';
import { SushiPairs } from '../../../../../src/swaps/domain/sushi-pairs';
import { SushiPairMother } from '../sushi-pair.mother';
import { BigIntegerMother } from '../../../shared/domain/big-integer.mother';
import { BigInteger } from '../../../../../src/shared/domain/BigInteger';

describe('sushiswap', () => {
  it('should throw exception if no possible trade', () => {
    // Arrange
    const sushi = new Sushiswap(
      httpClientMock({
        post: () =>
          Promise.resolve({
            data: {
              pairs: [],
            },
          }),
      }),
      sushiRepositoryMock({
        getPairs: () => Promise.resolve(new SushiPairs([SushiPairMother.linkUsdc()])),
      }),
    );
    const swapRequest = new SwapRequest(
      Polygon,
      TokenMother.link(),
      TokenMother.sushi(),
      1,
      BigIntegerMother.random(),
      BigIntegerMother.random(),
    );

    // Act
    const call = sushi.execute(swapRequest);

    // Assert
    expect(call).rejects.toEqual(new Error('INSUFFICIENT_LIQUIDITY'));
  });

  it('should return a correctly constructed order', async () => {
    // Arrange
    const sushiswap = new Sushiswap(
      httpClientMock(),
      sushiRepositoryMock({
        getPairs: () =>
          Promise.resolve(
            new SushiPairs([SushiPairMother.linkUsdc(), SushiPairMother.sushiUsdc()]),
          ),
      }),
    );
    const link = TokenMother.link();
    const sushi = TokenMother.sushi();
    const swapRequest = new SwapRequest(
      Polygon,
      link,
      sushi,
      2,
      BigInteger.fromDecimal('100'),
      BigInteger.fromDecimal('99'),
    );

    // Act
    const swapOrder = await sushiswap.execute(swapRequest);

    // Assert
    expect(swapOrder.required).toBeTruthy();
    expect(swapOrder.providerCode).toEqual('1');
    expect(swapOrder.amountIn.toDecimal()).toEqual('100.0');
    expect(swapOrder.expectedAmountOut.toString()).toEqual('97460453597434260112');
    expect(swapOrder.expectedMinAmountOut.toString()).toEqual('95511244525485574909');
    expect(swapOrder.worstCaseAmountOut.toString()).toEqual('94574594381018816853');
    expect(swapOrder.tokenIn).toEqual(link);
    expect(swapOrder.tokenOut).toEqual(sushi);
    expect(swapOrder.data).toContain(
      '0x' +
        '38ed1739' +
        '0000000000000000000000000000000000000000000000056bc75e2d63100000' +
        '0000000000000000000000000000000000000000000000052e03e38c5c8a24b5' +
        '00000000000000000000000000000000000000000000000000000000000000a0' +
        '0000000000000000000000001a6e1ef1d28a7d9fed016c88f4d1858367564781',
    );
    // doing this because sushi/sdk inserts a deadline, which is computed from the current time
    // so between those two blocks there is an argument that changes each time.
    // This is solid enough since we still check that data contains what we think it does.
    expect(swapOrder.data).toContain(
      '0000000000000000000000000000000000000000000000000000000000000003' +
        '000000000000000000000000fe8746ad240c1e766561b0d1bf6befdb8ceaea9f' +
        '0000000000000000000000001adce3cd2ab61bbfb3605c08118559ecdff1fec4' +
        '0000000000000000000000006f86ee19cc2ed23f168deba8bcb7be3ff9cb06fa',
    );
  });
});
