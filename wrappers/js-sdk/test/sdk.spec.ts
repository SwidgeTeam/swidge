import Swidge from '../src';

describe('Swidge SDK', () => {
  let sdk: Swidge;

  beforeEach(() => {
    jest.clearAllMocks()
    sdk = new Swidge()
  })

  it('should fetch tokens', async () => {
    await sdk.getTokens();
  });
});