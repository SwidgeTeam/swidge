import { Route } from '../../../../src/shared/domain/route/route';
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
import { ProviderDetails } from '../../../../src/shared/domain/provider-details';

export class RouteMother {
  public static create(
    resume: RouteResume,
    txDetails: TransactionDetails,
    providers: ProviderDetails[],
  ): Route {
    const aggregatorDetails = new AggregatorDetails(AggregatorProviders.Swidge);
    const fees = new RouteFees(BigInteger.zero(), '');
    return new Route(aggregatorDetails, resume, fees, providers, null, txDetails);
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

    return this.create(resume, txDetails, [ProviderDetailsMother.random()]);
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

    return this.create(resume, txDetails, [
      ProviderDetailsMother.random(),
      ProviderDetailsMother.random(),
    ]);
  }
}