import { SearchCriteria } from '../../../../src/shared/domain/search-criteria';

class TestSearchCriteria extends SearchCriteria {}

describe('SearchCriteria', () => {
  it('should say not exists when non existent params', () => {
    // Arrange
    const criteria = new TestSearchCriteria().set('bar', 'loo');

    // Act && Assert
    expect(criteria.exists('foo')).toBeFalsy();
  });

  it('should say not exists when empty params', () => {
    // Arrange
    const criteria = new TestSearchCriteria().set('foo', '');

    // Act && Assert
    expect(criteria.exists('foo')).toBeFalsy();
  });

  it('should say exists and return value', () => {
    // Arrange
    const criteria = new TestSearchCriteria().set('foo', 'bar');

    // Act && Assert
    expect(criteria.exists('foo')).toBeTruthy();
    expect(criteria.get('foo')).toEqual('bar');
  });
});
