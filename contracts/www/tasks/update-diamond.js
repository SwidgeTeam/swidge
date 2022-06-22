const getAccounts = require("./helpers/accounts.js");
const { getAddresses } = require("./helpers/addresses.js");
const { FacetCutAction, getSelectors } = require("../scripts/libs/diamond");

module.exports = async function (taskArguments, hre, runSuper) {
  const { deployer } = await getAccounts(hre);
  const chain = taskArguments.chain;
  const addresses = getAddresses()[chain];

  const routerFacet = await hre.ethers.getContractAt(
    "RouterFacet",
    addresses.facet.router
  );

  const facets = [routerFacet];

  const cuts = [];
  for (const facet of facets) {
    cuts.push({
      facetAddress: facet.address,
      action: FacetCutAction.Replace,
      functionSelectors: getSelectors(facet),
    });
  }
  const diamondCutter = await hre.ethers.getContractAt(
    "IDiamondCutter",
    addresses.diamond
  );
  await diamondCutter.connect(deployer).diamondCut(cuts);
};
