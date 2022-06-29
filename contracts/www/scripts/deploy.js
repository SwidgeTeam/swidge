const { FacetCutAction, getSelectors } = require("./libs/diamond");

const deployAll = async (ethers, deployer, relayer) => {
  const [diamondProxy, diamondCutterFacet] = await deployDiamond(
    ethers,
    deployer
  );

  const [relayerUpdater, router, diamondLoupe, providerUpdater] =
    await deployFacets(ethers, deployer, diamondProxy.address);

  await updateRelayer(ethers, deployer, diamondProxy.address, relayer.address);

  return {
    diamondProxy: diamondProxy,
    diamondCutterFacet: diamondCutterFacet,
    diamondLoupeFacet: diamondLoupe,
    relayerUpdaterFacet: relayerUpdater,
    providerUpdaterFacet: providerUpdater,
    routerFacet: router,
  };
};

/**
 * Deploys minimal, diamond and cutter facet in one move
 * @param ethers
 * @param deployer
 * @returns {Promise<*[]>}
 */
const deployDiamond = async (ethers, deployer) => {
  // deploy DiamondCutterFacet
  const DiamondCutterFacet = await ethers.getContractFactory(
    "DiamondCutterFacet"
  );
  const diamondCutterFacet = await DiamondCutterFacet.connect(
    deployer
  ).deploy();
  await diamondCutterFacet.deployed();

  // deploy Diamond
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.connect(deployer).deploy(
    diamondCutterFacet.address
  );
  await diamond.deployed();

  return [diamond, diamondCutterFacet];
};

/**
 * Deploy and add all the facets
 * @param ethers
 * @param deployer
 * @param diamondAddress
 * @returns {Promise<*[]>}
 */
const deployFacets = async (ethers, deployer, diamondAddress) => {
  // deploy RelayerUpdaterFacet
  const RelayerUpdaterFacet = await ethers.getContractFactory(
    "RelayerUpdaterFacet"
  );
  const relayerUpdaterFacet = await RelayerUpdaterFacet.connect(
    deployer
  ).deploy();
  await relayerUpdaterFacet.deployed();

  // deploy ProviderUpdaterFacet
  const ProviderUpdaterFacet = await ethers.getContractFactory(
    "ProviderUpdaterFacet"
  );
  const providerUpdaterFacet = await ProviderUpdaterFacet.connect(
    deployer
  ).deploy();
  await providerUpdaterFacet.deployed();

  // deploy ProviderUpdaterFacet
  const DiamondLoupeFacet = await ethers.getContractFactory(
    "DiamondLoupeFacet"
  );
  const diamondLoupeFacet = await DiamondLoupeFacet.connect(deployer).deploy();
  await diamondLoupeFacet.deployed();

  // deploy RouterFacet
  const RouterFacet = await ethers.getContractFactory("RouterFacet");
  const routerFacet = await RouterFacet.connect(deployer).deploy();
  await routerFacet.deployed();

  // update facets
  const facets = [
    routerFacet,
    relayerUpdaterFacet,
    diamondLoupeFacet,
    providerUpdaterFacet,
  ];
  const cuts = [];
  for (const facet of facets) {
    cuts.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }

  const diamondCutter = await ethers.getContractAt(
    "IDiamondCutter",
    diamondAddress
  );
  await (await diamondCutter.connect(deployer).diamondCut(cuts)).wait();

  return [
    relayerUpdaterFacet,
    routerFacet,
    diamondLoupeFacet,
    providerUpdaterFacet,
  ];
};

const updateRelayer = async (
  ethers,
  deployer,
  diamondAddress,
  relayerAddress
) => {
  const relayerUpdater = await ethers.getContractAt(
    "RelayerUpdaterFacet",
    diamondAddress
  );

  // update the relayer's address
  await (
    await relayerUpdater.connect(deployer).updateRelayer(relayerAddress)
  ).wait();
};

module.exports = {
  deployAll,
  deployDiamond,
  deployFacets,
};
