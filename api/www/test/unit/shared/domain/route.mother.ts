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

export class RouteMother {
  public static create(
    resume: RouteResume,
    txDetails: TransactionDetails,
    steps: RouteStep[],
  ): Route {
    const aggregatorDetails = new AggregatorDetails(AggregatorProviders.Swidge);
    return new Route(aggregatorDetails, resume, steps, null, txDetails);
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
      ),
    ];

    return this.create(resume, txDetails, steps);
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
      ),
      new RouteStep(
        'bridge',
        ProviderDetailsMother.random(),
        TokenMother.random(),
        TokenMother.random(),
        BigIntegerMother.random(),
        BigIntegerMother.random(),
        '0.' + faker.random.numeric(3),
      ),
      new RouteStep(
        'swap',
        ProviderDetailsMother.random(),
        TokenMother.random(),
        token2,
        BigIntegerMother.random(),
        BigIntegerMother.random(),
        '0.' + faker.random.numeric(3),
      ),
    ];

    return this.create(resume, txDetails, steps);
  }
}
