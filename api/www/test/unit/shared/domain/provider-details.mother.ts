import { ProviderDetails } from '../../../../src/shared/domain/provider-details';
import { faker } from '@faker-js/faker';

export class ProviderDetailsMother {
  public static create(name: string, logo: string): ProviderDetails {
    return new ProviderDetails(name, logo);
  }

  public static random(): ProviderDetails {
    return this.create(faker.name.firstName(), faker.image.imageUrl());
  }
}
