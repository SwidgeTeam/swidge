export type URL = string;
export type Headers = Record<string, string>;
export type Parameters = Record<string, unknown>;

export interface IHttpClient {
  get<Response>(url: URL, headers?: Headers): Promise<Response>;

  post<Response>(url: URL, params: Parameters, headers?: Headers): Promise<Response>;

  patch<Response>(url: URL, params: Parameters, headers?: Headers): Promise<Response>;

  put<Response>(url: URL, params: Parameters, headers?: Headers): Promise<Response>;

  delete<Response>(url: URL, headers?: Headers, params?: Parameters): Promise<Response>;
}
