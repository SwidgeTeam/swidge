import { ClientConfig } from '@polywrap/client-js';
import { Connection, Connections, ethereumPlugin } from '@polywrap/ethereum-plugin-js';
import { ETHEREUM_KEY, FANTOM_KEY, POLYGON_KEY } from './types/constants';
import { Chains } from './types/metadata';

export function clientConfig(): Partial<ClientConfig> {
  return {
    interfaces: [
      {
        interface: "wrap://ipfs/QmTiD79pbKfyc58w2VA7ktsNbnhNw7o9dekca7SKyAjKiq",
        implementations: [
          "wrap://ipfs/Qmeojn81JiJyMJJisRSsJDHF7JshjMtWAXPJocyfi3KtWK" // Rango
        ]
      },
    ],
    plugins: [
      {
        uri: "wrap://ens/ethereum.polywrap.eth",
        plugin: ethereumPlugin({
          connections: new Connections({
            networks: {
              [ETHEREUM_KEY]: new Connection({ provider: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161" }),
              [POLYGON_KEY]: new Connection({ provider: "https://polygon-rpc.com/" }),
              [FANTOM_KEY]: new Connection({ provider: "https://rpc.ftm.tools/" }),
            },
          }),
        }),
      }
    ]
  }
}

export const NETWORKS: Chains = [
  {
    id: ETHEREUM_KEY,
    type: "EVM",
    name: "Ethereum",
    logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg",
  },
  {
    id: POLYGON_KEY,
    type: "EVM",
    name: "Polygon",
    logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg",
  },
  {
    id: FANTOM_KEY,
    type: "EVM",
    name: "Fantom",
    logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/fantom.svg",
  }
];