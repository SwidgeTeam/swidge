import { TokenList } from '../../../../src/tokens/domain/TokenItem';
import { TokenListItemMother } from './TokenListItem.mother';

describe('token-list', () => {
  it('should find a token', async () => {
    /** Arrange */
    const items = [
      TokenListItemMother.ofChainAndAddress('1', '0x1'),
      TokenListItemMother.ofChainAndAddress('1', '0x2'),
      TokenListItemMother.ofChainAndAddress('2', '0x3'),
      TokenListItemMother.ofChainAndAddress('2', '0x4'),
    ];
    const tokenList = new TokenList(items);

    /** Act */
    const filtered = tokenList.find('2', '0x3');

    /** Assert */
    expect(filtered.address).toEqual('0x3');
  });

  it('should return empty when not found', async () => {
    /** Arrange */
    const items = [
      TokenListItemMother.ofChainAndAddress('1', '0x1'),
      TokenListItemMother.ofChainAndAddress('1', '0x2'),
      TokenListItemMother.ofChainAndAddress('2', '0x3'),
      TokenListItemMother.ofChainAndAddress('2', '0x4'),
    ];
    const tokenList = new TokenList(items);

    /** Act */
    const filtered = tokenList.find('5', '0x5');

    /** Assert */
    expect(filtered).toEqual(null);
  });
});
