const getAccounts = require("./helpers/accounts.js");
const { getAddresses } = require("./helpers/addresses.js");
const { FacetCutAction, getSelectors } = require("../scripts/libs/diamond");

module.exports = async function (taskArguments, hre, runSuper) {
  const { deployer } = await getAccounts(hre);
  const chain = taskArguments.chain;
  const facetName = taskArguments.facet;
  const addresses = getAddresses()[chain];

  const Facet = await hre.ethers.getContractFactory(facetName);
  const facet = await Facet.connect(deployer).deploy();
  await facet.deployed();

  // update facets
  const cuts = [
    {
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    },
  ];

  const diamondCutter = await hre.ethers.getContractAt(
    "IDiamondCutter",
    addresses.diamond
  );

  (await diamondCutter.connect(deployer).diamondCut(cuts)).wait();
};
