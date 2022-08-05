import { TokenListItem } from '../../../../src/tokens/domain/TokenListItem';

export class TokenListItemMother {
  public static create(
    chainId: string,
    address: string,
    name: string,
    decimals: number,
    symbol: string,
    logo: string,
    externalId: string,
    price: number,
  ) {
    return new TokenListItem(chainId, address, name, decimals, symbol, logo, externalId, price);
  }

  public static ofChainAndAddress(chainId: string, address: string) {
    return this.create(chainId, address, 'NAME', 6, 'SYM', 'logo', 'eid', 0);
  }
}
