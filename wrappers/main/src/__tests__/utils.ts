import { ClientConfig } from "@polywrap/client-js";
import { providers, ensAddresses } from "@polywrap/test-env-js";
import { ensResolverPlugin } from "@polywrap/ens-resolver-plugin-js";
import { Connection, Connections, ethereumPlugin } from "@polywrap/ethereum-plugin-js";
import { ipfsPlugin } from "@polywrap/ipfs-plugin-js";
import { ContractFactory, Contract, Signer, ethers } from 'ethers';
import { abi, bytecode } from './contracts/JobsQueue';
import nock from 'nock';

export function getConfig(): Partial<ClientConfig> {
  return {
    redirects: [],
    plugins: [
      {
        uri: "wrap://ens/ipfs.polywrap.eth",
        plugin: ipfsPlugin({ provider: providers.ipfs }),
      },
      {
        uri: "wrap://ens/ens-resolver.polywrap.eth",
        plugin: ensResolverPlugin({ addresses: { testnet: ensAddresses.ensAddress } }),
      },
      {
        uri: "wrap://ens/ethereum.polywrap.eth",
        plugin: ethereumPlugin({
          connections: new Connections({
            networks: {
              testnet: new Connection({ provider: providers.ethereum }),
            },
            defaultNetwork: "testnet",
          }),
        }),
      },
    ],
  };
}

export async function deployQueue(): Promise<string> {
  const signer = getSigner();
  const factory = new ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(signer.getAddress());
  await contract.deployed();
  await contract.connect(signer).updateOrigins([signer.getAddress()]);
  return contract.address;
}

export async function createJob(queue: string, args: any[]): Promise<void> {
  const signer = getSigner();
  const contract = new Contract(queue, abi);
  const calldata = ethers.utils.defaultAbiCoder.encode(
    ["bytes16", "address", "address", "address", "uint256", "uint256", "uint256"],
    args
  );
  await contract.connect(signer).createJob(calldata);
}

export function mockEndpoint(basePath: string, url: string, result: any) {
  nock(basePath)
    .get(url)
    .reply(200, result);
}

function getSigner(): Signer {
  const connection = new Connection({ provider: providers.ethereum });
  return connection.getSigner();
}

