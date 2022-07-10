import { restore, stub } from 'sinon';
import { CachedHttpClient } from '../../../../src/shared/http/cachedHttpClient';
import axios from 'axios';

describe('CachedHttpClient', () => {
  const myAxios = axios.create();

  beforeEach(() => {
    stub(axios, 'create').returns(myAxios);
  });

  afterEach(() => {
    restore();
  });

  it('should only make the request on the first call', async () => {
    // Arrange
    const callStub = stub(myAxios, 'get').resolves({
      foo: 'bar',
    });
    const client = CachedHttpClient.create();

    // Act
    const callOne = await client.get('/some-path?with=arguments');
    const callTwo = await client.get('/some-path?with=arguments');
    const callThree = await client.get('/some-path?with=arguments');

    // Assert
    expect(callStub.callCount).toEqual(1);
    expect(callOne).toEqual({ foo: 'bar' });
    expect(callTwo).toEqual({ foo: 'bar' });
    expect(callThree).toEqual({ foo: 'bar' });
    expect(callStub.firstCall.args).toEqual([
      '/some-path?with=arguments',
      {
        headers: undefined,
      },
    ]);
  });
});
