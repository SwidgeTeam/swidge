const { FacetCutAction, getSelectors } = require("./libs/diamond");

const deployAll = async (ethers, deployer, relayer) => {
  const [diamondProxy, diamondCutterFacet] = await deployDiamond(
    ethers,
    deployer
  );

  const [relayerUpdater, router, diamondLoupe] = await deployFacets(
    ethers,
    deployer,
    diamondProxy.address
  );

  await updateRelayer(ethers, diamondProxy.address, relayer.address);

  return {
    diamondProxy: diamondProxy,
    diamondCutterFacet: diamondCutterFacet,
    diamondLoupeFacet: diamondLoupe,
    relayerUpdaterFacet: relayerUpdater,
    routerFacet: router,
  };
};

const deployDiamond = async (ethers, deployer) => {
  // deploy DiamondCutterFacet
  const DiamondCutterFacet = await ethers.getContractFactory(
    "DiamondCutterFacet"
  );
  const diamondCutterFacet = await DiamondCutterFacet.connect(
    deployer
  ).deploy();
  await diamondCutterFacet.deployed();

  // deploy DiamondProxy
  const DiamondProxy = await ethers.getContractFactory("DiamondProxy");
  const diamondProxy = await DiamondProxy.connect(deployer).deploy(
    diamondCutterFacet.address
  );
  await diamondProxy.deployed();

  return [diamondProxy, diamondCutterFacet];
};

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
  const facets = [routerFacet, relayerUpdaterFacet, diamondLoupeFacet];
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
  (await diamondCutter.diamondCut(cuts)).wait();

  return [relayerUpdaterFacet, routerFacet, diamondLoupeFacet];
};

const updateRelayer = async (ethers, diamondAddress, relayerAddress) => {
  const relayerUpdater = await ethers.getContractAt(
    "RelayerUpdaterFacet",
    diamondAddress
  );

  // update the relayer's address
  (await relayerUpdater.functions.updateRelayer(relayerAddress)).wait();
};

module.exports = {
  deployAll,
  deployDiamond,
  deployFacets,
};
