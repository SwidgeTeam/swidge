import axios, { Axios, AxiosError, AxiosResponse } from 'axios';
import { IHttpClient } from './IHttpClient';

export type URL = string;
export type Headers = Record<string, string>;
export type Parameters = Record<string, unknown>;

export class HttpClient implements IHttpClient {
  private readonly axios: Axios;

  public static create(baseURL?: URL) {
    return new HttpClient(baseURL);
  }

  public constructor(baseURL?: URL) {
    this.axios = axios.create({
      baseURL: baseURL,
    });
    this.initializeMiddleware();
  }

  /**
   * Requests a GET
   * @param url
   * @param headers
   */
  public get<Response>(url: URL, headers?: Headers): Promise<Response> {
    return this.axios.get(url, {
      headers: headers,
    });
  }

  /**
   * Requests a POST
   * @param url
   * @param params
   * @param headers
   */
  public post<Response>(url: URL, params: Parameters, headers?: Headers): Promise<Response> {
    return this.axios.post(url, params, {
      headers: headers,
    });
  }

  /**
   * Requests PATCH
   * @param url
   * @param params
   * @param headers
   */
  public patch<Response>(url: URL, params: Parameters, headers?: Headers): Promise<Response> {
    return this.axios.patch(url, params, {
      headers: headers,
    });
  }

  /**
   * Requests a PUT
   * @param url
   * @param params
   * @param headers
   */
  public put<Response>(url: URL, params: Parameters, headers?: Headers): Promise<Response> {
    return this.axios.put(url, params, {
      headers: headers,
    });
  }

  /**
   * Requests a DELETE
   * @param url
   * @param headers
   * @param params
   */
  public delete<Response>(url: URL, headers?: Headers, params?: Parameters): Promise<Response> {
    return this.axios.delete(url, {
      headers: headers,
      data: params,
    });
  }

  /**
   * Sets middlewares into the client for common behaviour managing
   * @private
   */
  private initializeMiddleware() {
    this.axios.interceptors.response.use(HttpClient.extractData, HttpClient.normalizeError);
  }

  /**
   * Extracts the valuable data from the server's response
   * @param response
   * @private
   */
  private static extractData(response: AxiosResponse) {
    return response.data;
  }

  /**
   * Converts the specific client error into a proprietary error for our apps
   * @private
   * @param err
   */
  private static normalizeError(err: AxiosError) {
    let error: any;

    if (err.response) {
      // Request succeeded
      error = err.response.data;
    } else if (err.request) {
      // Request failed
      error = 'Server unavailable';
    } else {
      // Fail to create request
      error = err.message;
    }

    throw error;
  }
}
