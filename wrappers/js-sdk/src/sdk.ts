import { PolywrapClient } from '@polywrap/client-js';
import { MetadataResponse } from './wrapper/types/metadata';
import { Metadata } from './types/metadata';
import { WRAPPER_URI } from './wrapper/constants';

export default class Swidge {
  private client;

  constructor() {
    this.client = new PolywrapClient()
  }

  async getTokens(): Promise<Metadata> {
    const result = await this.client.invoke<MetadataResponse>({
      uri: WRAPPER_URI,
      method: "getMetadata",
      args: {}
    });

    if (!result.ok) {
      throw new Error("Error fetching tokens");
    }

    return {
      chains: result.value.chains.map(chain => {
        return {
          type: chain.chain_type,
          id: chain.chain_id,
          name: chain.name,
          logo: chain.logo,
        }
      }),
      tokens: result.value.tokens
    }
  }
}