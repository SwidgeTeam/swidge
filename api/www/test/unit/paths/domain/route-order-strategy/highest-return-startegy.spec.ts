import { HighestReturnStrategy } from '../../../../../src/paths/domain/route-order-strategy/highest-return-strategy';
import { RouteMother } from '../../../shared/domain/route.mother';

describe('highest return strategy', () => {
  it('should order routes from highest to lowest return', async () => {
    // Arrange
    const strategy = new HighestReturnStrategy();
    const routes = [];
    for (let i = 0; i < 500; i++) {
      routes.push(RouteMother.randomSingleSwap());
    }

    // Act
    const orderedRoutes = strategy.order(routes);

    // Assert
    for (let i = 0; i < orderedRoutes.length - 1; i++) {
      const previousAmount = orderedRoutes[i].resume.amountOut;
      const laterAmount = orderedRoutes[i + 1].resume.amountOut;
      const previousGreaterOrEqualThanLater = previousAmount.greaterOrEqualThan(laterAmount);
      expect(previousGreaterOrEqualThanLater).toBeTruthy();
    }
  });
});
