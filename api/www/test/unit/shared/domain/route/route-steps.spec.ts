import { BigInteger } from '../../../../../src/shared/domain/big-integer';
import { RouteStep } from '../../../../../src/shared/domain/route/route-step';
import { ProviderDetailsMother } from '../provider-details.mother';
import { TokenMother } from '../token.mother';
import { BigIntegerMother } from '../big-integer.mother';
import { RouteSteps } from '../../../../../src/shared/domain/route/route-steps';

describe('route-steps', () => {
  it('should compute correct totals', () => {
    // Arrange
    const steps = new RouteSteps([
      new RouteStep(
        'swap',
        ProviderDetailsMother.random(),
        TokenMother.random(),
        TokenMother.random(),
        BigIntegerMother.random(),
        BigIntegerMother.random(),
        '0.15',
        30,
      ),
      new RouteStep(
        'bridge',
        ProviderDetailsMother.random(),
        TokenMother.random(),
        TokenMother.random(),
        BigIntegerMother.random(),
        BigIntegerMother.random(),
        '0.15',
        40,
      ),
      new RouteStep(
        'swap',
        ProviderDetailsMother.random(),
        TokenMother.random(),
        TokenMother.random(),
        BigIntegerMother.random(),
        BigInteger.fromString('101010'),
        '0.15',
        50,
      ),
    ]);

    // Act
    const totalTime = steps.totalExecutionTime();
    const totalFees = steps.totalFeesInUsd();
    const lastAmountOut = steps.lastAmountOut();

    // Assert
    expect(totalTime).toEqual(120);
    expect(lastAmountOut.toString()).toEqual('101010');
    expect(totalFees).toBeGreaterThan(0.445);
    expect(totalFees).toBeLessThan(0.45);
    // ^ cant bother anymore now, srry
  });
});
