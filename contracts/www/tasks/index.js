const { task } = require("hardhat/config");

task("deploy-diamond", "Deploy Diamond proxy on current network")
  .setAction(require("./deploy-diamond"));

task("deploy-all", "Deploy all contracts on current network")
  .addParam("chain", "Name of the network to deploy")
  .setAction(require("./deploy-all"));

task("get-tokens", "Get tokens on the forked network")
  .addParam("chain", "Name of the network to deploy")
  .addParam("token", "Name of the token you want to get")
  .setAction(require("./get-tokens"));
