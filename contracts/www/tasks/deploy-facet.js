const getAccounts = require("./helpers/accounts.js");
const { getAddresses, saveAddresses } = require("./helpers/addresses.js");
const { FacetCutAction, getSelectors } = require("../scripts/libs/diamond");

module.exports = async function (taskArguments, hre, runSuper) {
  const { deployer } = await getAccounts(hre);
  const chain = taskArguments.chain;
  const facetName = taskArguments.facet;
  const allAddresses = getAddresses();
  const addresses = allAddresses[chain];

  // deploy new facet
  const Facet = await hre.ethers.getContractFactory(facetName);
  const facet = await Facet.connect(deployer).deploy();
  await facet.deployed();

  // get loupe handler
  const diamondLoupe = await hre.ethers.getContractAt(
    "IDiamondLoupe",
    addresses.diamond
  );

  // get existing address of this facet
  const previousAddress = addresses.facet[facetName];
  const cuts = [];

  // if the address exists means the facet it's already deployed,
  // so we have to remove the selectors before we can instruct
  // to add them again
  if (previousAddress) {
    // fetch current selectors of the facet
    const previousSelectors = await diamondLoupe
      .connect(deployer)
      .facetFunctionSelectors(previousAddress);

    // create the remove cut
    cuts.push({
      facetAddress: hre.ethers.constants.AddressZero,
      action: FacetCutAction.Remove,
      functionSelectors: previousSelectors,
    });
  }

  // create the addition cut
  cuts.push({
    facetAddress: facet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(facet),
  });

  // get cutter handler
  const diamondCutter = await hre.ethers.getContractAt(
    "IDiamondCutter",
    addresses.diamond
  );

  // cut diamont
  (await diamondCutter.connect(deployer).diamondCut(cuts)).wait();

  // save new facet address
  allAddresses[chain].facet[facetName] = facet.address;
  saveAddresses(allAddresses);
};
