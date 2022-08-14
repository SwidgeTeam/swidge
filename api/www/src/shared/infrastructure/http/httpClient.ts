import axios, { Axios, AxiosError, AxiosResponse } from 'axios';
import { IHttpClient, URL, Config } from '../../domain/http/IHttpClient';

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
   * @param config
   */
  public get<Response>(url: URL, config?: Config): Promise<Response> {
    return this.axios.get(url, {
      headers: config ? config.headers : undefined,
      params: config ? config.params : undefined,
    });
  }

  /**
   * Requests a POST
   * @param url
   * @param config
   */
  public post<Response>(url: URL, config?: Config): Promise<Response> {
    return this.axios.post(url, config.params, {
      headers: config ? config.headers : undefined,
    });
  }

  /**
   * Requests PATCH
   * @param url
   * @param config
   */
  public patch<Response>(url: URL, config?: Config): Promise<Response> {
    return this.axios.patch(url, config.params, {
      headers: config ? config.headers : undefined,
    });
  }

  /**
   * Requests a PUT
   * @param url
   * @param config
   */
  public put<Response>(url: URL, config?: Config): Promise<Response> {
    return this.axios.put(url, config.params, {
      headers: config ? config.headers : undefined,
    });
  }

  /**
   * Requests a DELETE
   * @param url
   * @param config
   */
  public delete<Response>(url: URL, config?: Config): Promise<Response> {
    return this.axios.delete(url, {
      headers: config ? config.headers : undefined,
      data: config ? config.params : undefined,
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
