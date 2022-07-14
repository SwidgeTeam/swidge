import { HttpClient, Parameters, URL, Headers } from './httpClient';
import { IHttpClient } from './IHttpClient';

export class CachedHttpClient implements IHttpClient {
  private readonly httpClient: HttpClient;
  private readonly cache: Map<string, any>;

  public static create(baseURL?: URL) {
    return new CachedHttpClient(baseURL);
  }

  public constructor(baseURL?: URL) {
    this.httpClient = HttpClient.create(baseURL);
    this.cache = new Map<string, any>();
  }

  /**
   * Requests a GET
   * @param url
   * @param headers
   */
  public get<Response>(url: URL, headers?: Headers): Promise<Response> {
    if (this.isCached(url)) {
      return this.cachedResponse(url);
    }
    const response = this.httpClient.get<Response>(url, headers);
    this.cache.set(url, response);
    return response;
  }

  /**
   * Requests a POST
   * @param url
   * @param params
   * @param headers
   */
  public post<Response>(url: URL, params: Parameters, headers: Headers): Promise<Response> {
    if (this.isCached(url)) {
      return this.cachedResponse(url);
    }
    const response = this.httpClient.post<Response>(url, params, headers);
    this.cache.set(url, response);
    return response;
  }

  /**
   * Requests PATCH
   * @param url
   * @param params
   * @param headers
   */
  public patch<Response>(url: URL, params: Parameters, headers: Headers): Promise<Response> {
    if (this.isCached(url)) {
      return this.cachedResponse(url);
    }
    const response = this.httpClient.patch<Response>(url, params, headers);
    this.cache.set(url, response);
    return response;
  }

  /**
   * Requests a PUT
   * @param url
   * @param params
   * @param headers
   */
  public put<Response>(url: URL, params: Parameters, headers: Headers): Promise<Response> {
    if (this.isCached(url)) {
      return this.cachedResponse(url);
    }
    const response = this.httpClient.put<Response>(url, params, headers);
    this.cache.set(url, response);
    return response;
  }

  /**
   * Requests a DELETE
   * @param url
   * @param headers
   * @param params
   */
  public delete<Response>(url: URL, headers: Headers, params?: Parameters): Promise<Response> {
    if (this.isCached(url)) {
      return this.cachedResponse(url);
    }
    const response = this.httpClient.delete<Response>(url, headers, params);
    this.cache.set(url, response);
    return response;
  }

  private isCached(url: URL): boolean {
    return this.cache.has(url);
  }

  private cachedResponse(url: URL): any {
    return this.cache.get(url);
  }
}
