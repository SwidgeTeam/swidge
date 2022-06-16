import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "./tasks/index";

import { HardhatUserConfig } from "hardhat/types";
import * as process from "process";

const accounts = {
  mnemonic:
    process.env.MNEMONIC ||
    "test test test test test test test test test test test junk",
};

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.1",
      },
    ],
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        enabled: process.env.FORKING === "true",
        url: `${process.env.FORKED_RPC_NODE}`,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    polygon: {
      url: process.env.RPC_NODE_POLYGON,
      accounts,
      chainId: 137,
      gasMultiplier: 4,
    },
    fantom: {
      url: process.env.RPC_NODE_FANTOM,
      accounts,
      chainId: 250,
      gasMultiplier: 4,
    },
  },
};

export default config;
