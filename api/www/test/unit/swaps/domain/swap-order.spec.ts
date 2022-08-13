import { SwapOrder } from '../../../../src/swaps/domain/swap-order';
import { TokenMother } from '../../shared/domain/token.mother';

describe('swap-order', () => {
  describe('not required', () => {
    it('Should have correct default values', () => {
      // Arrange
      const order = SwapOrder.notRequired();

      // Assert
      expect(order.providerCode).toEqual('0');
      expect(order.data).toEqual('0x');
    });
  });

  describe('same token', () => {
    it('Should have correct default value', () => {
      // Arrange
      const order = SwapOrder.sameToken(TokenMother.random());

      // Assert
      expect(order.providerCode).toEqual('0');
      expect(order.data).toEqual('0x');
    });
  });
});
