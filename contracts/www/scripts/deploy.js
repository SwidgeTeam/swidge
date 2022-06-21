const { FacetCutAction, getSelectors } = require("./libs/diamond");
const { getAddresses } = require("../tasks/helpers/addresses");

const deployAll = async (ethers, deployer, relayer, network) => {
  const allAddresses = getAddresses();
  const addresses = allAddresses[network];

  const [diamondProxy, diamondCutterFacet] = await deployDiamond(
    ethers,
    deployer
  );

  const [providerUpdater, router] = await deployFacets(
    ethers,
    deployer,
    diamondProxy.address
  );

  const [zeroEx, anyswap] = await deployProviders(ethers, deployer, addresses);

  await updateProviders(
    zeroEx,
    anyswap,
    providerUpdater,
    addresses,
    diamondProxy.address,
    relayer.address
  );

  return {
    diamondProxy: diamondProxy,
    diamondCutterFacet: diamondCutterFacet,
    providerUpdaterFacet: providerUpdater,
    routerFacet: router,
    zeroEx: zeroEx,
    anyswap: anyswap,
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
  // deploy ProviderUpdaterFacet
  const ProviderUpdaterFacet = await ethers.getContractFactory(
    "ProviderUpdaterFacet"
  );
  const providerUpdaterFacet = await ProviderUpdaterFacet.connect(
    deployer
  ).deploy();
  await providerUpdaterFacet.deployed();

  // deploy RouterFacet
  const RouterFacet = await ethers.getContractFactory("RouterFacet");
  const routerFacet = await RouterFacet.connect(deployer).deploy();
  await routerFacet.deployed();

  // update facets
  const facets = [routerFacet, providerUpdaterFacet];
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
  await diamondCutter.diamondCut(cuts);

  return [providerUpdaterFacet, routerFacet];
};

const deployProviders = async (ethers, deployer, addresses) => {
  // deploy ZeroEx
  const ZeroEx = await ethers.getContractFactory("ZeroEx");
  const zeroEx = await ZeroEx.connect(deployer).deploy();
  await zeroEx.deployed();

  // deploy Anyswap
  const Anyswap = await ethers.getContractFactory("Anyswap");
  const anyswap = await Anyswap.connect(deployer).deploy(
    addresses.providers.bridge.anyswap
  );
  await anyswap.deployed();

  return [zeroEx, anyswap];
};

const updateProviders = async (
  zeroEx,
  anyswap,
  providerUpdater,
  addresses,
  diamondAddress,
  relayerAddress
) => {
  // update diamond's address on implementations
  await zeroEx.updateRouter(diamondAddress);
  await anyswap.updateRouter(diamondAddress);

  // set implementations addresses on diamond
  await providerUpdater.updateSwapProvider(
    addresses.implementation.swap.zeroex.code,
    zeroEx.address
  );
  await providerUpdater.functions.updateBridgeProvider(
    addresses.implementation.bridge.anyswap.code,
    anyswap.address
  );

  // update the relayer's address
  await providerUpdater.functions.updateRelayer(relayerAddress);
};

module.exports = {
  deployAll,
  deployDiamond,
  deployFacets,
  deployProviders,
  updateProviders,
};
