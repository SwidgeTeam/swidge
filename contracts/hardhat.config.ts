import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

import {HardhatUserConfig} from "hardhat/types";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.1",
            }
        ],
        settings: {
            outputSelection: {
                "*": {
                    "*": ["storageLayout"]
                }
            }
        }
    },
    defaultNetwork: "hardhat",
};

export default config;
