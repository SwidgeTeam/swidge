import { ClientConfig, PolywrapClient, Uri } from '@polywrap/client-js';
import { MetadataResponse } from './wrapper/types/metadata';
import { Metadata } from './types/metadata';
import { WRAPPER_URI } from './wrapper/constants';
import { Connection, Connections, ethereumPlugin } from '@polywrap/ethereum-plugin-js';

export default class Swidge {
  private client;

  constructor() {
    this.client = new PolywrapClient(Swidge.clientConfig())
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


  private static clientConfig(): Partial<ClientConfig> {
    return {
      interfaces: [
        {
          interface: "wrap://ipfs/QmbaTvgNrDafcChhFZw83aSKMq57iyWwdvWzuMhWKmgj55",
          implementations: [
            "wrap://ipfs/QmNfgGbY8s1TRr8mRahE6RxDzsBkj1o7a6VJs2ne6mGFgB",
            "wrap://ipfs/QmVZptPRpj4KyER6Ry1wzm4HNKBxRPS4Gs6Xhoy2tmg4kp"
          ]
        },
      ],
      plugins: [
        {
          uri: "wrap://ens/ethereum.polywrap.eth",
          plugin: ethereumPlugin({
            connections: new Connections({
              networks: {
                mainnet: new Connection({ provider: "https://mainnet.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6" }),
              },
            }),
          }),
        }
      ]
    }
  }

}
