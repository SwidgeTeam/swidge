module.exports = async function getAccounts(hre) {
  const [d1, relayer, d2, deployer, user] = await hre.ethers.getSigners();

  return {
    deployer: deployer,
    relayer: relayer,
    user: user,
  };
};
