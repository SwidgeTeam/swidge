import { Token } from '../../../../src/shared/domain/Token';
import { faker } from '@faker-js/faker';

export class TokenMother {
  public static create(name: string, address: string, decimals: number, symbol: string) {
    return new Token(name, address, decimals, symbol);
  }

  public static link() {
    return this.create('LINK', '0xLINK', 18, 'LINK');
  }

  public static sushi() {
    return this.create('SUSHI', '0xSUSHI', 18, 'SUSHI');
  }

  public static random() {
    return this.create(
      faker.name.firstName(),
      faker.random.alphaNumeric(42),
      18,
      faker.name.firstName(),
    );
  }
}
