const { task } = require("hardhat/config");

task("deploy-all", "Deploy all contracts on current network")
  .addParam("chain", "Name of the network to deploy")
  .setAction(require("./deploy-all"));

task("update-diamond", "Updates relation of selectors-adresses")
  .addParam("chain", "Name of the target network")
  .addParam("facet", "Name of the facet to update")
  .setAction(require("./update-diamond"));

task("verify-diamond", "Verifies the diamond contract")
  .addParam("chain", "Name of the target network")
  .setAction(require("./verify-diamond"));

task("get-tokens", "Get tokens on the forked network")
  .addParam("chain", "Name of the network to deploy")
  .addParam("token", "Name of the token you want to get")
  .setAction(require("./get-tokens"));
