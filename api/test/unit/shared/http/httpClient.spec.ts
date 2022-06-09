import { spy, restore, stub } from 'sinon';
import axios, {
  Axios,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { HttpClient } from '../../../../src/shared/http/httpClient';

describe('HttpClient', () => {
  afterEach(() => {
    restore();
  });

  describe('construction', () => {
    it('should set the a given base URL', () => {
      // Arrange
      const createSpy = spy(axios, 'create');

      // Act
      HttpClient.create('my-url');

      // Assert
      expect(
        createSpy.calledOnceWith({
          baseURL: 'my-url',
        }),
      ).toBeTruthy();
    });
  });

  describe('requests', () => {
    describe('interceptors', () => {
      const myAxios = axios.create();

      beforeEach(() => {
        stub(axios, 'create').returns(myAxios);
      });

      it('should return only the data inside the response', () => {
        // Arrange
        HttpClient.create();
        const responseFake = {
          data: {
            content: 'something-here',
          },
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const fulfilled = myAxios.interceptors.response.handlers[0].fulfilled;

        // Act
        const result = fulfilled(responseFake);

        // Assert
        expect(result).toEqual({
          content: 'something-here',
        });
      });

      it('should return the received error message on valid response', () => {
        const error = getAxiosError();
        error.response = <AxiosResponse>{
          data: 'here-my-message',
        };
        assertMessageOnOutputError(myAxios, error, 'here-my-message');
      });

      it('should return generic message when request failed', () => {
        const error = getAxiosError();
        error.response = undefined;
        error.request = true;
        assertMessageOnOutputError(myAxios, error, 'Server unavailable');
      });

      it('should return reason error message when setting request failed', () => {
        const error = getAxiosError();
        error.message = 'wat-did-u-do?';
        assertMessageOnOutputError(myAxios, error, 'wat-did-u-do?');
      });

      function getAxiosError(): AxiosError {
        return {
          config: <AxiosRequestConfig>{},
          isAxiosError: false,
          message: '',
          name: '',
          response: undefined,
          request: undefined,
          stack: '',
          toJSON(): object {
            return {};
          },
        };
      }

      function assertMessageOnOutputError(
        axios: Axios,
        error: AxiosError,
        message: string,
      ) {
        // Arrange
        HttpClient.create();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const rejected = axios.interceptors.response.handlers[0].rejected;

        // Act & Assert
        expect(() => {
          rejected(error);
        }).toThrowError(message);
      }
    });

    describe('calls', () => {
      const myAxios = axios.create();

      beforeEach(() => {
        stub(axios, 'create').returns(myAxios);
      });

      it('should execute GET request with correct parameters', async () => {
        // Arrange
        const callStub = stub(myAxios, 'get').resolves({});
        const client = HttpClient.create();

        // Act
        await client.get('/some-path?with=arguments', {
          some: 'header',
        });

        // Assert
        expect(callStub.firstCall.args).toEqual([
          '/some-path?with=arguments',
          {
            headers: {
              some: 'header',
            },
          },
        ]);
      });

      it('should execute POST request with correct parameters', async () => {
        // Arrange
        const callStub = stub(myAxios, 'post').resolves({});
        const client = HttpClient.create();

        // Act
        await client.post(
          '/some-path',
          {
            something: 'here',
            else: 'there',
          },
          {
            some: 'header',
          },
        );

        // Assert
        expect(callStub.firstCall.args).toEqual([
          '/some-path',
          {
            something: 'here',
            else: 'there',
          },
          {
            headers: {
              some: 'header',
            },
          },
        ]);
      });

      it('should execute PUT request with correct parameters', async () => {
        // Arrange
        const callStub = stub(myAxios, 'put').resolves({});
        const client = HttpClient.create();

        // Act
        await client.put(
          '/some-path',
          {
            something: 'here',
            else: 'there',
          },
          {
            some: 'header',
          },
        );

        // Assert
        expect(callStub.firstCall.args).toEqual([
          '/some-path',
          {
            something: 'here',
            else: 'there',
          },
          {
            headers: {
              some: 'header',
            },
          },
        ]);
      });

      it('should execute PATCH request with correct parameters', async () => {
        // Arrange
        const callStub = stub(myAxios, 'patch').resolves({});
        const client = HttpClient.create();

        // Act
        await client.patch(
          '/some-path',
          {
            something: 'here',
            else: 'there',
          },
          {
            some: 'header',
          },
        );

        // Assert
        expect(callStub.firstCall.args).toEqual([
          '/some-path',
          {
            something: 'here',
            else: 'there',
          },
          {
            headers: {
              some: 'header',
            },
          },
        ]);
      });

      it('should execute DELETE request with correct parameters', async () => {
        // Arrange
        const callStub = stub(myAxios, 'delete').resolves({});
        const client = HttpClient.create();

        // Act
        await client.delete(
          '/some-path',
          {
            some: 'header',
          },
          {
            something: 'here',
            else: 'there',
          },
        );

        // Assert
        expect(callStub.firstCall.args).toEqual([
          '/some-path',
          {
            data: {
              something: 'here',
              else: 'there',
            },
            headers: {
              some: 'header',
            },
          },
        ]);
      });
    });
  });
});
