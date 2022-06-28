const getAccounts = require("./helpers/accounts.js");
const { getAddresses, saveAddresses } = require("./helpers/addresses.js");

module.exports = async function (taskArguments, hre, runSuper) {
  const { deployer } = await getAccounts(hre);
  const chain = taskArguments.chain;
  const bridgeName = taskArguments.bridge;
  const allAddresses = getAddresses();
  const addresses = allAddresses[chain];
  const bridgeDetails = addresses.bridge[bridgeName];

  const Bridge = await hre.ethers.getContractFactory(bridgeName);
  const bridge = await Bridge.connect(deployer).deploy(
    ...bridgeDetails.arguments
  );
  await bridge.deployed();

  const providerUpdater = await hre.ethers.getContractAt(
    "ProviderUpdaterFacet",
    addresses.diamond
  );

  (
    await providerUpdater.connect(deployer).updateBridge({
      code: bridgeDetails.code,
      enabled: bridgeDetails.enabled,
      contractAddress: bridge.address,
    })
  ).wait();

  allAddresses[chain].bridge[bridgeName].implementation = bridge.address;
  saveAddresses(allAddresses);
};
