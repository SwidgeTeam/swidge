import { Route } from '../../../../src/shared/domain/route/route';
import { RouteStep } from '../../../../src/shared/domain/route/route-step';
import { TransactionDetails } from '../../../../src/shared/domain/route/transaction-details';
import { RouteResume } from '../../../../src/shared/domain/route/route-resume';
import { faker } from '@faker-js/faker';
import { BigIntegerMother } from './big-integer.mother';
import { ProviderDetailsMother } from './provider-details.mother';
import { TokenMother } from './token.mother';
import { AggregatorProviders } from '../../../../src/aggregators/domain/providers/aggregator-providers';
import { AggregatorDetails } from '../../../../src/shared/domain/aggregator-details';
import { RouteFees } from '../../../../src/shared/domain/route/route-fees';
import { BigInteger } from '../../../../src/shared/domain/big-integer';
import { RouteSteps } from '../../../../src/shared/domain/route/route-steps';

export class RouteMother {
  public static create(
    resume: RouteResume,
    txDetails: TransactionDetails,
    steps: RouteSteps,
  ): Route {
    const aggregatorDetails = new AggregatorDetails(AggregatorProviders.Swidge);
    const fees = new RouteFees(BigInteger.zero(), '');
    return new Route(aggregatorDetails, resume, steps, fees, null, txDetails);
  }

  public static randomSingleSwap(): Route {
    const token1 = TokenMother.random();
    const token2 = TokenMother.random();
    const resume = new RouteResume(
      '1',
      '1',
      token1,
      token2,
      BigIntegerMother.random(),
      BigIntegerMother.random(),
      BigIntegerMother.random(),
      0,
    );
    const txDetails = new TransactionDetails(
      faker.finance.ethereumAddress(),
      faker.random.alphaNumeric(200),
      BigIntegerMother.random(),
      BigIntegerMother.random(),
    );
    const steps = [
      new RouteStep(
        'swap',
        ProviderDetailsMother.random(),
        token1,
        token2,
        BigIntegerMother.random(),
        BigIntegerMother.random(),
        '0.' + faker.random.numeric(3),
        0,
      ),
    ];

    return this.create(resume, txDetails, new RouteSteps(steps));
  }

  public static randomCrossChain(): Route {
    const token1 = TokenMother.random();
    const token2 = TokenMother.random();
    const resume = new RouteResume(
      '1',
      '2',
      token1,
      token2,
      BigIntegerMother.random(),
      BigIntegerMother.random(),
      BigIntegerMother.random(),
      0,
    );
    const txDetails = new TransactionDetails(
      faker.finance.ethereumAddress(),
      faker.random.alphaNumeric(200),
      BigIntegerMother.random(),
      BigIntegerMother.random(),
    );
    const steps = [
      new RouteStep(
        'swap',
        ProviderDetailsMother.random(),
        token1,
        TokenMother.random(),
        BigIntegerMother.random(),
        BigIntegerMother.random(),
        '0.' + faker.random.numeric(3),
        0,
      ),
      new RouteStep(
        'bridge',
        ProviderDetailsMother.random(),
        TokenMother.random(),
        TokenMother.random(),
        BigIntegerMother.random(),
        BigIntegerMother.random(),
        '0.' + faker.random.numeric(3),
        0,
      ),
      new RouteStep(
        'swap',
        ProviderDetailsMother.random(),
        TokenMother.random(),
        token2,
        BigIntegerMother.random(),
        BigIntegerMother.random(),
        '0.' + faker.random.numeric(3),
        0,
      ),
    ];

    return this.create(resume, txDetails, new RouteSteps(steps));
  }
}
