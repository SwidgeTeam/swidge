import { Token } from '../../../../src/shared/domain/token';
import { faker } from '@faker-js/faker';

export class TokenMother {
  public static create(name: string, address: string, decimals: number, symbol: string) {
    return new Token('', name, address, decimals, symbol);
  }

  public static link() {
    return this.create('LINK', '0xfe8746ad240c1e766561b0d1bf6befdb8ceaea9f', 18, 'LINK');
  }

  public static polygonLink() {
    return this.create('LINK', '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', 18, 'LINK');
  }

  public static polygonMatic() {
    return this.create('MATIC', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 18, 'MATIC');
  }

  public static sushi() {
    return this.create('SUSHI', '0x6f86ee19cc2ed23f168deba8bcb7be3ff9cb06fa', 18, 'SUSHI');
  }

  public static usdc() {
    return this.create('USDC', '0x1adce3cd2ab61bbfb3605c08118559ecdff1fec4', 6, 'USDC');
  }

  public static fantomUsdc() {
    return this.create('USDC', '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', 6, 'USDC');
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
