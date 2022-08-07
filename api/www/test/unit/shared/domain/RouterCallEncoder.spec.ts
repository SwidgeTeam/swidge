import { SwapOrder } from '../../../../src/swaps/domain/SwapOrder';
import { BridgingOrder } from '../../../../src/bridges/domain/bridging-order';
import { RouterCallEncoder } from '../../../../src/shared/domain/router-call-encoder';
import { BigInteger } from '../../../../src/shared/domain/BigInteger';

describe('router-call-encoder', () => {
  it('should encode a default callData correctly', () => {
    // Arrange
    const originSwap = SwapOrder.notRequired();
    const bridgeOrder = BridgingOrder.notRequired();
    const destinationSwap = SwapOrder.notRequired();
    const encoder = new RouterCallEncoder();
    const amountIn = BigInteger.fromDecimal('10');

    // Act
    const callData = encoder.encode(amountIn, originSwap, bridgeOrder, destinationSwap);

    // Assert
    expect(callData).toEqual(
      '0x5c551f450000000000000000000000000000000000000000000000008ac7230489e8000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    );
  });
});
