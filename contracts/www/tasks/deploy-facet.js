const getAccounts = require("./helpers/accounts.js");
const { getAddresses, saveAddresses } = require("./helpers/addresses.js");
const { FacetCutAction, getSelectors } = require("../scripts/libs/diamond");

module.exports = async function (taskArguments, hre, runSuper) {
  const { deployer } = await getAccounts(hre);
  const chain = taskArguments.chain;
  const facetName = taskArguments.facet;
  const allAddresses = getAddresses();
  const addresses = allAddresses[chain];

  const Facet = await hre.ethers.getContractFactory(facetName);
  const facet = await Facet.connect(deployer).deploy();
  await facet.deployed();

  const diamondLoupe = await hre.ethers.getContractAt(
    "IDiamondLoupe",
    addresses.diamond
  );

  const previousAddress = addresses.facet[facetName];
  const cuts = [];

  if (previousAddress) {
    const previousSelectors = await diamondLoupe
      .connect(deployer)
      .facetFunctionSelectors(previousAddress);

    cuts.push({
      facetAddress: hre.ethers.constants.AddressZero,
      action: FacetCutAction.Remove,
      functionSelectors: previousSelectors,
    });
  }

  // update facets
  cuts.push({
    facetAddress: facet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(facet),
  });

  const diamondCutter = await hre.ethers.getContractAt(
    "IDiamondCutter",
    addresses.diamond
  );

  (await diamondCutter.connect(deployer).diamondCut(cuts)).wait();

  allAddresses[chain].facet[facetName] = facet.address;
  saveAddresses(allAddresses);
};
