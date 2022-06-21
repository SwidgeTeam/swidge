const { FacetCutAction, getSelectors } = require("./libs/diamond");
const { getAddresses } = require("../tasks/helpers/addresses");

const deployAll = async (ethers, signer, network) => {
  const allAddresses = getAddresses();
  const addresses = allAddresses[network];

  const [diamondProxy, diamondCutterFacet] = await deployDiamond(ethers, signer);

  const [providerUpdaterFacet, routerFacet] = await deployFacets(ethers, signer, diamondProxy.address);

  const [zeroEx, anyswap] = await deployProviders(ethers, signer, addresses);

  return {
    diamondProxy: diamondProxy,
    diamondCutterFacet: diamondCutterFacet,
    providerUpdaterFacet: providerUpdaterFacet,
    routerFacet: routerFacet,
    zeroEx: zeroEx,
    anyswap: anyswap,
  };
};

const deployDiamond = async (ethers, signer) => {
  // deploy DiamondCutterFacet
  const DiamondCutterFacet = await ethers.getContractFactory("DiamondCutterFacet");
  const diamondCutterFacet = await DiamondCutterFacet.connect(signer).deploy();
  await diamondCutterFacet.deployed();

  // deploy DiamondProxy
  const DiamondProxy = await ethers.getContractFactory("DiamondProxy");
  const diamondProxy = await DiamondProxy.connect(signer).deploy(
    diamondCutterFacet.address
  );
  await diamondProxy.deployed();

  return [diamondProxy, diamondCutterFacet];
};

const deployFacets = async (ethers, signer, diamondAddress) => {
  // deploy ProviderUpdaterFacet
  const ProviderUpdaterFacet = await ethers.getContractFactory("ProviderUpdaterFacet");
  const providerUpdaterFacet = await ProviderUpdaterFacet.connect(signer).deploy();
  await providerUpdaterFacet.deployed();

  // deploy RouterFacet
  const RouterFacet = await ethers.getContractFactory("RouterFacet");
  const routerFacet = await RouterFacet.connect(signer).deploy();
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

const deployProviders = async (ethers, signer, addresses) => {
  // deploy ZeroEx
  const ZeroEx = await ethers.getContractFactory("ZeroEx");
  const zeroEx = await ZeroEx.connect(signer).deploy();
  await zeroEx.deployed();

  // deploy Anyswap
  const Anyswap = await ethers.getContractFactory("Anyswap");
  const anyswap = await Anyswap.connect(signer).deploy(
    addresses.providers.bridge.anyswap
  );
  await anyswap.deployed();

  return [zeroEx, anyswap];
};

module.exports = {
  deployAll,
  deployDiamond,
  deployFacets,
  deployProviders,
};
