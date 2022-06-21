const getAccounts = require("./helpers/accounts.js");
const { getAddresses, saveAddresses } = require("./helpers/addresses.js");
const { deployAll } = require("../scripts/deploy");

module.exports = async function (taskArguments, hre, runSuper) {
  const { deployer, relayer } = await getAccounts(hre);
  const network = taskArguments.chain;
  const allAddresses = getAddresses();
  const addresses = allAddresses[network];

  const contracts = await deployAll(hre.ethers, deployer, network);

  // update diamond's address on implementations
  await contracts.zeroEx.updateRouter(contracts.diamondProxy.address);
  await contracts.anyswap.updateRouter(contracts.diamondProxy.address);

  // set implementations addresses on diamond
  const providersUpdater = await hre.ethers.getContractAt(
    "ProviderUpdaterFacet",
    contracts.diamondProxy.address
  );
  await providersUpdater.updateSwapProvider(
    addresses.implementation.swap.zeroex.code,
    contracts.zeroEx.address
  );
  await providersUpdater.updateBridgeProvider(
    addresses.implementation.bridge.anyswap.code,
    contracts.anyswap.address
  );

  // update the relayer's address
  await providersUpdater.updateRelayer(relayer.address);

  // persist new addresses
  const addr = allAddresses[hre.network.name];

  addr.diamond = contracts.diamondProxy.address;
  addr.facet.router = contracts.routerFacet.address;
  addr.facet.providerUpdater = contracts.providerUpdaterFacet.address;
  addr.facet.cutter = contracts.diamondCutterFacet.address;
  addr.implementation.bridge.anyswap.address = contracts.anyswap.address;
  addr.implementation.swap.zeroex.address = contracts.zeroEx.address;

  allAddresses[hre.network.name] = addr;

  saveAddresses(allAddresses);
};
