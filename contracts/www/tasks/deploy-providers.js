const getAccounts = require("./helpers/accounts.js");
const { getAddresses } = require("./helpers/addresses.js");
const { deployProviders, updateProviders } = require("../scripts/deploy");

module.exports = async function (taskArguments, hre, runSuper) {
  const { deployer, relayer } = await getAccounts(hre);
  const chain = taskArguments.chain;
  const addresses = getAddresses()[chain];

  const [zeroEx, anyswap] = await deployProviders(
    hre.ethers,
    deployer,
    addresses
  );

  // if process fails we need to acces the already deployed contracts
  //const zeroEx = await hre.ethers.getContractAt(
  //  "ZeroEx",
  //  addresses.implementation.swap.zeroex.address
  //);
  //const anyswap = await hre.ethers.getContractAt(
  //  "Anyswap",
  //  addresses.implementation.bridge.anyswap.address
  //);

  await updateProviders(
    hre.ethers,
    zeroEx,
    anyswap,
    addresses,
    addresses.diamond,
    relayer.address
  );
};
