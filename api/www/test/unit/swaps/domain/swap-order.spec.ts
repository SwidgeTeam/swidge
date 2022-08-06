import { SwapOrder } from '../../../../src/swaps/domain/SwapOrder';

describe('swap-order', () => {
  it('Should have correct default value', () => {
    // Arrange
    const order = SwapOrder.notRequired();

    // Assert
    expect(order.providerCode).toEqual('0');
    expect(order.data).toEqual('0x');
  });
});
