import { HttpClient, Parameters, URL, Headers } from './httpClient';
import { IHttpClient } from './IHttpClient';

export class CachedHttpClient implements IHttpClient {
  private readonly httpClient: HttpClient;
  private readonly cache: Map<string, any>;
  private readonly deadline: Map<string, number>;
  private readonly CACHE_TIME = 60 * 60 * 1000;

  public static create(baseURL?: URL) {
    return new CachedHttpClient(baseURL);
  }

  public constructor(baseURL?: URL) {
    this.httpClient = HttpClient.create(baseURL);
    this.cache = new Map<string, any>();
    this.deadline = new Map<string, number>();
  }

  /**
   * Requests a GET
   * @param url
   * @param headers
   */
  public async get<Response>(url: URL, headers?: Headers): Promise<Response> {
    if (this.isCached(url)) {
      return this.cachedResponse(url);
    }
    const response = await this.httpClient.get<Response>(url, headers);
    this.setCache(url, response);
    return response;
  }

  /**
   * Requests a POST
   * @param url
   * @param params
   * @param headers
   */
  public async post<Response>(url: URL, params: Parameters, headers?: Headers): Promise<Response> {
    if (this.isCached(url)) {
      return this.cachedResponse(url);
    }
    const response = await this.httpClient.post<Response>(url, params, headers);
    this.setCache(url, response);
    return response;
  }

  /**
   * Requests PATCH
   * @param url
   * @param params
   * @param headers
   */
  public async patch<Response>(url: URL, params: Parameters, headers?: Headers): Promise<Response> {
    if (this.isCached(url)) {
      return this.cachedResponse(url);
    }
    const response = await this.httpClient.patch<Response>(url, params, headers);
    this.setCache(url, response);
    return response;
  }

  /**
   * Requests a PUT
   * @param url
   * @param params
   * @param headers
   */
  public async put<Response>(url: URL, params: Parameters, headers?: Headers): Promise<Response> {
    if (this.isCached(url)) {
      return this.cachedResponse(url);
    }
    const response = await this.httpClient.put<Response>(url, params, headers);
    this.setCache(url, response);
    return response;
  }

  /**
   * Requests a DELETE
   * @param url
   * @param headers
   * @param params
   */
  public async delete<Response>(
    url: URL,
    headers?: Headers,
    params?: Parameters,
  ): Promise<Response> {
    if (this.isCached(url)) {
      return this.cachedResponse(url);
    }
    const response = await this.httpClient.delete<Response>(url, headers, params);
    this.setCache(url, response);
    return response;
  }

  /**
   * Checks if the request is elegible to use the cache data
   * @param url
   * @private
   */
  private isCached(url: URL): boolean {
    const exists = this.cache.has(url);
    if (!exists) {
      return false;
    }
    return new Date().getTime() < this.deadline.get(url);
  }

  /**
   * Stores a response to a given URL
   * @param url
   * @param response
   * @private
   */
  private setCache(url: string, response: any) {
    this.cache.set(url, response);
    this.deadline.set(url, this.getDeadline());
  }

  /**
   * Computes the deadline given the current time
   * @private
   */
  private getDeadline(): number {
    return new Date().getTime() + this.CACHE_TIME;
  }

  /**
   * Returns the cached response of a URL
   * @param url
   * @private
   */
  private cachedResponse(url: URL): any {
    return this.cache.get(url);
  }
}
