import chai, { expect } from "chai";
import { ethers } from "hardhat";
import {
  fakeTokenContract,
  getAccounts,
  RandomAddress,
  ZeroAddress,
  zeroExEncodedCalldata,
} from "../shared";
import { Contract } from "ethers";
import { smock } from "@defi-wonderland/smock";

const Deployer = require("../../scripts/Deployer");

chai.use(smock.matchers);

describe("RouterFacet - finalize", function () {
  let providerUpdater: Contract;
  let router: Contract;
  let zeroEx: Contract;

  beforeEach(async () => {
    const { owner, relayer } = await getAccounts();
    const deployer = new Deployer(ethers, owner, relayer);
    await deployer.deploy();

    providerUpdater = await deployer.interactWith("ProviderUpdaterFacet");
    router = await deployer.interactWith("RouterFacet");

    zeroEx = await deployer.deployByName("ZeroEx");
  });

  it("Should fail if anyone else than relayer is the caller", async function () {
    /** Arrange */
    const { anyoneElse } = await getAccounts();

    /** Act */
    const call = router
      .connect(anyoneElse)
      .finalizeSwidge(
        1000000,
        RandomAddress,
        "0x02b0672e488733a606cc52bd19e865de313c7e1e019fb6204c01a9bdcfa08cca",
        [1, RandomAddress, RandomAddress, "0x", false]
      );

    /** Assert */
    await expect(call).to.be.revertedWith("Must be relayer");
  });

  it("Should execute the swap if relayer is the caller", async function () {
    /** Arrange */
    const { owner, relayer } = await getAccounts();

    // Create two fake ERC20 tokens
    const fakeTokenIn = await fakeTokenContract();
    const fakeTokenOut = await fakeTokenContract();

    // Fake response from executed methods on the output token
    fakeTokenOut.balanceOf.returnsAtCall(0, 10);
    fakeTokenOut.balanceOf.returnsAtCall(1, 20);

    const [callData] = await zeroExEncodedCalldata();

    await providerUpdater
      .connect(owner)
      .updateSwapper([0, true, zeroEx.address, ZeroAddress]);

    /** Act */
    const call = router
      .connect(relayer)
      .finalizeSwidge(
        1000000,
        RandomAddress,
        "0x02b0672e488733a606cc52bd19e865de313c7e1e019fb6204c01a9bdcfa08cca",
        [0, fakeTokenIn.address, fakeTokenOut.address, callData, true]
      );

    /** Assert */
    await expect(call)
      .to.emit(router, "CrossFinalized")
      .withArgs(
        "0x02b0672e488733a606cc52bd19e865de313c7e1e019fb6204c01a9bdcfa08cca",
        10
      );
  });

  it("Should revert if the provider fails", async function () {
    /** Arrange */
    const { relayer } = await getAccounts();

    // Create two fake ERC20 tokens
    const fakeTokenIn = await fakeTokenContract();
    const fakeTokenOut = await fakeTokenContract();

    const [callData] = await zeroExEncodedCalldata();

    /** Act */
    const call = router
      .connect(relayer)
      .finalizeSwidge(
        1000000,
        RandomAddress,
        "0x02b0672e488733a606cc52bd19e865de313c7e1e019fb6204c01a9bdcfa08cca",
        [0, fakeTokenIn.address, fakeTokenOut.address, callData, true]
      );

    /** Assert */
    await expect(call).to.be.reverted;
  });
});
