const getAccounts = require("./helpers/accounts.js");
const { getAddresses, saveAddresses } = require("./helpers/addresses.js");
const { deployAll } = require("../scripts/deploy");

module.exports = async function (taskArguments, hre, runSuper) {
  const { deployer, relayer } = await getAccounts(hre);
  const network = taskArguments.chain;
  const allAddresses = getAddresses();

  const contracts = await deployAll(hre.ethers, deployer, relayer, network);

  // persist new addresses
  const addr = allAddresses[hre.network.name];

  addr.diamond = contracts.diamondProxy.address;
  addr.facet.router = contracts.routerFacet.address;
  addr.facet.relayerUpdater = contracts.relayerUpdaterFacet.address;
  addr.facet.cutter = contracts.diamondCutterFacet.address;

  allAddresses[hre.network.name] = addr;

  saveAddresses(allAddresses);
};
