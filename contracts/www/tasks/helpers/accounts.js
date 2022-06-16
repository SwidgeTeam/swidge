module.exports = async function getAccounts(hre) {
  const [deployer, relayer, user] = await hre.ethers.getSigners();

  return {
    deployer: deployer,
    relayer: relayer,
    user: user,
  };
};
