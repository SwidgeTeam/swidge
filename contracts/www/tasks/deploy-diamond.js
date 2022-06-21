const getAccounts = require("./helpers/accounts.js");
const { getAddresses, saveAddresses } = require("./helpers/addresses.js");

module.exports = async function (taskArguments, hre, runSuper) {
  const { deployer } = await getAccounts(hre);
  // deploy DiamondCutterFacet
  const DiamondCutterFacet = await hre.ethers.getContractFactory(
    "DiamondCutterFacet"
  );
  const diamondCutterFacet = await DiamondCutterFacet.connect(deployer).deploy();
  await diamondCutterFacet.deployed();

  // deploy DiamondProxy
  const DiamondProxy = await hre.ethers.getContractFactory("DiamondProxy");
  const diamondProxy = await DiamondProxy.connect(deployer).deploy(
    diamondCutterFacet.address
  );
  await diamondProxy.deployed();

  // Persist new address
  const allAddresses = getAddresses();
  const connectedNetwork = hre.network.name;
  allAddresses[connectedNetwork].diamond = diamondProxy.address;
  saveAddresses(allAddresses);

  console.log("Deploy proxy OK");
};
