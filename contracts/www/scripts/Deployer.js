const { FacetCutAction, getSelectors } = require("./libs/diamond");
const { ethers } = require("hardhat");

module.exports = class Deployer {
  ethers;
  deployer;
  relayer;
  diamond;

  constructor(_ethers, _deployer, _relayer) {
    this.ethers = _ethers;
    this.deployer = _deployer;
    this.relayer = _relayer;
  }

  /**
   * Deploy and initialize a new diamond
   * @returns {Promise<void>}
   */
  async deploy() {
    const diamondCutterFacet = await this.deployByName("DiamondCutterFacet");

    this.diamond = await this.deployByName("Diamond", [
      diamondCutterFacet.address,
    ]);

    const relayerUpdaterFacet = await this.deployByName("RelayerUpdaterFacet");
    const providerUpdaterFacet = await this.deployByName(
      "ProviderUpdaterFacet"
    );
    const diamondLoupeFacet = await this.deployByName("DiamondLoupeFacet");
    const feeManagerFacet = await this.deployByName("FeeManagerFacet");
    const routerFacet = await this.deployByName("RouterFacet");

    await this.setFacets([
      routerFacet,
      relayerUpdaterFacet,
      diamondLoupeFacet,
      providerUpdaterFacet,
      feeManagerFacet,
    ]);

    await this.updateRelayer();
  }

  /**
   * Add the given facets to the diamond
   * @param facets
   * @returns {Promise<void>}
   */
  async setFacets(facets) {
    const cuts = [];
    for (const facet of facets) {
      cuts.push({
        facetAddress: facet.address,
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(facet),
      });
    }

    const diamondCutter = await this.ethers.getContractAt(
      "IDiamondCutter",
      this.diamond.address
    );
    await (await diamondCutter.connect(this.deployer).diamondCut(cuts)).wait();
  }

  /**
   * Update the relayer address on the diamond
   * @returns {Promise<void>}
   */
  async updateRelayer() {
    const relayerUpdater = await this.interactWith("RelayerUpdaterFacet");
    await (
      await relayerUpdater
        .connect(this.deployer)
        .updateRelayer(this.relayer.address)
    ).wait();
  }

  /**
   * Get an instance of a deployed contract
   * @param contractName
   * @returns {Promise<Contract>}
   */
  async interactWith(contractName) {
    return await ethers.getContractAt(contractName, this.diamond.address);
  }

  /**
   * Deploy a specific contract by name
   * @param contractName
   * @param args
   * @returns {Promise<*>}
   */
  async deployByName(contractName, args = []) {
    const Factory = await this.ethers.getContractFactory(contractName);
    const contract = await Factory.connect(this.deployer).deploy(...args);
    await contract.deployed();
    return contract;
  }
};
