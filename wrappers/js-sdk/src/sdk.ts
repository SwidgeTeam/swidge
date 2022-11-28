import { PolywrapClient } from '@polywrap/client-js';
import { TokensResponse } from './types/wrapper/metadata';
import { Chains, Tokens } from './types/metadata';
import { WRAPPER_URI } from './types/wrapper/constants';
import { clientConfig, NETWORKS } from './config';

export default class Swidge {
  private client;

  constructor() {
    this.client = new PolywrapClient(clientConfig())
  }

  public getChains(): Chains {
    return NETWORKS;
  }

  async getTokens(): Promise<Tokens> {
    const result = await this.client.invoke<TokensResponse>({
      uri: WRAPPER_URI,
      method: "getTokens",
      args: {}
    });

    if (!result.ok) {
      throw new Error("Error fetching tokens");
    }

    return result.value;
  }
}
