const getAccounts = require("./helpers/accounts.js");
const { getAddresses, saveAddresses } = require("./helpers/addresses.js");

module.exports = async function (taskArguments, hre, runSuper) {
  // We get the contract to deploy
  const Router = await hre.ethers.getContractFactory("Router");
  const ZeroEx = await hre.ethers.getContractFactory("ZeroEx");
  const Anyswap = await hre.ethers.getContractFactory("Anyswap");

  const network = taskArguments.chain;

  const { deployer, relayer } = await getAccounts(hre);
  const allAddresses = getAddresses();
  const addresses = allAddresses[network];

  const router = await Router.connect(deployer).deploy();
  const zeroEx = await ZeroEx.connect(deployer).deploy();
  const anyswap = await Anyswap.connect(deployer).deploy(
    addresses.bridges.anyswap
  );

  // Deploy contracts
  await router.deployed();
  await zeroEx.deployed();
  await anyswap.deployed();

  // Update router's address on implementations
  await zeroEx.functions.updateRouter(router.address);
  await anyswap.functions.updateRouter(router.address);

  // Set implementations addresses on router
  await router.functions.updateSwapProvider(
    addresses.swapImpl.zeroex.code,
    anyswap.address
  );
  await router.functions.updateBridgeProvider(
    addresses.bridgeImpl.anyswap.code,
    anyswap.address
  );

  // Update the relayer's address
  await router.functions.updateRelayer(relayer.address);

  // Persist new addresses
  const connectedNetwork = hre.network.name;
  allAddresses[connectedNetwork].router = router.address;
  allAddresses[connectedNetwork].bridgeImpl.anyswap.address = anyswap.address;
  allAddresses[connectedNetwork].swapImpl.zeroex.address = zeroEx.address;
  saveAddresses(allAddresses);

  console.log("Deploy OK");
};
