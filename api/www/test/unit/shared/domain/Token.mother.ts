import { Token } from '../../../../src/shared/domain/Token';
import { faker } from '@faker-js/faker';

export class TokenMother {
  public static create(name: string, address: string, decimals: number, symbol: string) {
    return new Token(name, address, decimals, symbol);
  }

  public static link() {
    return this.create('LINK', faker.finance.ethereumAddress(), 18, 'LINK');
  }

  public static sushi() {
    return this.create('SUSHI', faker.finance.ethereumAddress(), 18, 'SUSHI');
  }

  public static usdc() {
    return this.create('USDC', faker.finance.ethereumAddress(), 6, 'USDC');
  }

  public static random() {
    return this.create(
      faker.name.firstName(),
      faker.finance.ethereumAddress(),
      18,
      faker.name.firstName(),
    );
  }
}
