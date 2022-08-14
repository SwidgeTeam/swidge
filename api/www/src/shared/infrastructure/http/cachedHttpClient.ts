import { IHttpClient, URL, Config, Parameters } from '../../domain/http/IHttpClient';
import { HttpClient } from './httpClient';

export class CachedHttpClient implements IHttpClient {
  private readonly httpClient: HttpClient;
  private readonly cache: Map<string, Map<string, any>>;
  private readonly deadline: Map<string, Map<string, number>>;
  private readonly CACHE_TIME = 60 * 60 * 1000;

  public static create(baseURL?: URL) {
    return new CachedHttpClient(baseURL);
  }

  public constructor(baseURL?: URL) {
    this.httpClient = HttpClient.create(baseURL);
    this.cache = new Map<string, Map<string, any>>();
    this.deadline = new Map<string, Map<string, number>>();
  }

  /**
   * Requests a GET
   * @param url
   * @param config
   */
  public async get<Response>(url: URL, config?: Config): Promise<Response> {
    const params = config ? config.params : undefined;
    if (this.isCached(url, params)) {
      return this.cachedResponse(url, params);
    }
    const response = await this.httpClient.get<Response>(url, config);
    this.setCache(url, params, response);
    return response;
  }

  /**
   * Requests a POST
   * @param url
   * @param config
   */
  public async post<Response>(url: URL, config?: Config): Promise<Response> {
    const params = config ? config.params : undefined;
    if (this.isCached(url, params)) {
      return this.cachedResponse(url, params);
    }
    const response = await this.httpClient.post<Response>(url, config);
    this.setCache(url, params, response);
    return response;
  }

  /**
   * Requests PATCH
   * @param url
   * @param config
   */
  public async patch<Response>(url: URL, config?: Config): Promise<Response> {
    const params = config ? config.params : undefined;
    if (this.isCached(url, params)) {
      return this.cachedResponse(url, params);
    }
    const response = await this.httpClient.patch<Response>(url, config);
    this.setCache(url, params, response);
    return response;
  }

  /**
   * Requests a PUT
   * @param url
   * @param config
   */
  public async put<Response>(url: URL, config?: Config): Promise<Response> {
    const params = config ? config.params : undefined;
    if (this.isCached(url, params)) {
      return this.cachedResponse(url, params);
    }
    const response = await this.httpClient.put<Response>(url, config);
    this.setCache(url, params, response);
    return response;
  }

  /**
   * Requests a DELETE
   * @param url
   * @param config
   */
  public async delete<Response>(url: URL, config?: Config): Promise<Response> {
    const params = config ? config.params : undefined;
    if (this.isCached(url, params)) {
      return this.cachedResponse(url, params);
    }
    const response = await this.httpClient.delete<Response>(url, config);
    this.setCache(url, params, response);
    return response;
  }

  /**
   * Checks if the request is elegible to use the cache data
   * @param url
   * @param params
   * @private
   */
  private isCached(url: URL, params: Parameters): boolean {
    const urlContent = this.cache.get(url);
    if (!urlContent) {
      return false;
    }
    const stringParams = JSON.stringify(params);
    const content = urlContent.get(stringParams);
    if (!content) {
      return false;
    }
    return new Date().getTime() < this.deadline.get(url).get(stringParams);
  }

  /**
   * Stores a response to a given URL
   * @param url
   * @param params
   * @param response
   * @private
   */
  private setCache(url: string, params: Parameters, response: any) {
    const deadline = this.getDeadline();
    const urlContent = this.cache.get(url);
    const stringParams = JSON.stringify(params);
    if (urlContent) {
      this.cache.get(url).set(stringParams, response);
      this.deadline.get(url).set(stringParams, deadline);
    } else {
      this.cache.set(url, new Map<string, any>([[stringParams, response]]));
      this.deadline.set(url, new Map<string, number>([[stringParams, deadline]]));
    }
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
   * @param params
   * @private
   */
  private cachedResponse(url: URL, params: Parameters): any {
    // we can do this unsafe get because always previously checked if `isCached`
    return this.cache.get(url).get(JSON.stringify(params));
  }
}
