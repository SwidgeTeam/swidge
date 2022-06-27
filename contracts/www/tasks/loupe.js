const { getAddresses } = require("./helpers/addresses.js");

module.exports = async function (taskArguments, hre, runSuper) {
  const chain = taskArguments.chain;
  const addresses = getAddresses()[chain];

  const loupe = await hre.ethers.getContractAt(
    "IDiamondLoupe",
    addresses.diamond
  );

  const facets = await loupe.facets();

  console.log(facets);
};
