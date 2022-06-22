import chai, { expect } from "chai";
import { ethers } from "hardhat";
import { getAccounts, ZeroAddress } from "../shared";
import { Contract } from "ethers";
import { smock } from "@defi-wonderland/smock";
const { deployDiamond, deployFacets } = require("../../scripts/deploy");

chai.use(smock.matchers);

describe("ProviderUpdaterFacet", function () {
  let contract: Contract;

  beforeEach(async () => {
    const { owner } = await getAccounts();
    const [diamondProxy] = await deployDiamond(ethers, owner);
    await deployFacets(ethers, owner, diamondProxy.address);
    contract = await ethers.getContractAt(
      "ProviderUpdaterFacet",
      diamondProxy.address
    );
  });

  describe("Update Relayer", () => {
    it("Should fail if anyone else than the owner tries to update the relayer", async function () {
      /** Arrange */
      const { anyoneElse, random } = await getAccounts();

      /** Act */
      const call = contract.connect(anyoneElse).updateRelayer(random.address);

      /** Assert */
      await expect(call).to.be.reverted;
    });

    it("Should fail if the new relayer address is ZeroAddress", async function () {
      /** Arrange */
      const { owner } = await getAccounts();

      /** Act */
      const call = contract.connect(owner).updateRelayer(ZeroAddress);

      /** Assert */
      await expect(call).to.be.reverted;
    });

    it("Should emit an event when the relayer is successfully updated", async function () {
      /** Arrange */
      const { owner, random } = await getAccounts();

      /** Act */
      const call = contract.connect(owner).updateRelayer(random.address);

      /** Assert */
      await expect(call)
        .to.emit(contract, "UpdatedRelayer")
        .withArgs(ZeroAddress, random.address);
    });
  });

  describe("Updated Bridge Provider", () => {
    it("Should fail if anyone else than the owner tries to update a bridge provider address", async function () {
      /** Arrange */
      const { anyoneElse, random } = await getAccounts();

      /** Act */
      const call = contract
        .connect(anyoneElse)
        .updateBridgeProvider(0, random.address);

      /** Assert */
      await expect(call).to.be.reverted;
    });

    it("Should fail if the new bridge provider address is ZeroAddress", async function () {
      /** Arrange */
      const { owner } = await getAccounts();

      /** Act */
      const call = contract.connect(owner).updateBridgeProvider(0, ZeroAddress);

      /** Assert */
      await expect(call).to.be.reverted;
    });

    it("Should emit an event when the bridge provider is successfully updated", async function () {
      /** Arrange */
      const { owner, random } = await getAccounts();

      /** Act */
      const call = contract
        .connect(owner)
        .updateBridgeProvider(0, random.address);

      /** Assert */
      await expect(call)
        .to.emit(contract, "UpdatedBridgeProvider")
        .withArgs(0, random.address);
    });
  });

  describe("Updated Swap Provider", () => {
    it("Should fail if anyone else than the owner tries to update a swap provider address", async function () {
      /** Arrange */
      const { anyoneElse, random } = await getAccounts();

      /** Act */
      const call = contract
        .connect(anyoneElse)
        .updateSwapProvider(0, random.address);

      /** Assert */
      await expect(call).to.be.reverted;
    });

    it("Should fail if the new swap provider address is ZeroAddress", async function () {
      /** Arrange */
      const { owner } = await getAccounts();

      /** Act */
      const call = contract.connect(owner).updateSwapProvider(0, ZeroAddress);

      /** Assert */
      await expect(call).to.be.reverted;
    });

    it("Should emit an event when the swap provider is successfully updated", async function () {
      /** Arrange */
      const { owner, random } = await getAccounts();

      /** Act */
      const call = contract
        .connect(owner)
        .updateSwapProvider(0, random.address);

      /** Assert */
      await expect(call)
        .to.emit(contract, "UpdatedSwapProvider")
        .withArgs(0, random.address);
    });
  });
});
