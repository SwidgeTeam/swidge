export type URL = string;
export type Headers = Record<string, string>;
export type Parameters = Record<string, unknown> | string;

export interface Config {
  params?: Parameters;
  headers?: Headers;
}

export interface IHttpClient {
  get<Response>(url: URL, config?: Config): Promise<Response>;

  post<Response>(url: URL, config?: Config): Promise<Response>;

  patch<Response>(url: URL, config?: Config): Promise<Response>;

  put<Response>(url: URL, config?: Config): Promise<Response>;

  delete<Response>(url: URL, config?: Config): Promise<Response>;
}
