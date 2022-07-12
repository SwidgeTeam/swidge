import { Token } from '../../../../src/shared/domain/Token';

export class TokenMother {
  public static link() {
    return new Token('LINK', '0xLINK', 18);
  }

  public static sushi() {
    return new Token('SUSHI', '0xSUSHI', 18);
  }
}