import chai, { expect } from "chai";
import { ethers } from "hardhat";
import {
  fakeTokenContract,
  getAccounts, NativeToken,
  RandomAddress,
  ZeroAddress,
  zeroExEncodedCalldata,
} from "../shared";
import { Contract } from "ethers";
import { smock } from "@defi-wonderland/smock";

const { deployDiamond, deployFacets } = require("../../scripts/deploy");

chai.use(smock.matchers);

describe("RouterFacet", function () {
  let relaterUpdater: Contract;
  let providerUpdater: Contract;
  let anyswap: Contract;
  let zeroEx: Contract;
  let router: Contract;

  beforeEach(async () => {
    const { owner } = await getAccounts();
    const [diamondProxy] = await deployDiamond(ethers, owner);
    await deployFacets(ethers, owner, diamondProxy.address);
    relaterUpdater = await ethers.getContractAt(
      "RelayerUpdaterFacet",
      diamondProxy.address
    );
    providerUpdater = await ethers.getContractAt(
      "ProviderUpdaterFacet",
      diamondProxy.address
    );
    const Anyswap = await ethers.getContractFactory(
      "Anyswap",
      diamondProxy.address
    );
    anyswap = await Anyswap.deploy();
    await anyswap.deployed();

    const ZeroEx = await ethers.getContractFactory(
      "ZeroEx",
      diamondProxy.address
    );
    zeroEx = await ZeroEx.deploy();
    await zeroEx.deployed();

    router = await ethers.getContractAt("RouterFacet", diamondProxy.address);
  });

  describe("Swidge init process", () => {
    it("Should revert if no swap nor bridge step is required", async function () {
      /** Arrange */
      const { anyoneElse } = await getAccounts();

      /** Act */
      const call = router
        .connect(anyoneElse)
        .initSwidge(
          1000000,
          [0, RandomAddress, RandomAddress, "0x", false],
          [RandomAddress, 57, "0x", false],
          [RandomAddress, RandomAddress]
        );

      /** Assert */
      await expect(call).to.be.revertedWith("No required actions");
    });

    it("Should only execute swap if no bridging step is required", async function () {
      /** Arrange */
      const { owner, anyoneElse } = await getAccounts();

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
        .connect(anyoneElse)
        .initSwidge(
          1000000,
          [0, fakeTokenIn.address, fakeTokenOut.address, callData, true],
          [RandomAddress, 1337, "0x", false],
          [RandomAddress, RandomAddress]
        );

      /** Assert */
      await expect(call)
        .to.emit(router, "SwapExecuted")
        .withArgs(
          fakeTokenIn.address,
          fakeTokenOut.address,
          31337,
          1000000,
          10
        );
    });

    it("Should only execute bridge if no swapping step is required", async function () {
      /** Arrange */
      const { owner, anyoneElse } = await getAccounts();

      // Create two fake ERC20 tokens
      const fakeTokenIn = await fakeTokenContract();

      const callData = ethers.utils.defaultAbiCoder.encode(
        ["address"],
        [RandomAddress]
      );

      await providerUpdater
        .connect(owner)
        .updateBridge([
          0,
          true,
          anyswap.address,
          "0x4f3aff3a747fcade12598081e80c6605a8be192f",
        ]);

      /** Act */
      const call = router
        .connect(anyoneElse)
        .initSwidge(
          1000000,
          [0, RandomAddress, RandomAddress, "0x", false],
          [fakeTokenIn.address, 1337, callData, true],
          [RandomAddress, RandomAddress]
        );

      /** Assert */
      await expect(call)
        .to.emit(router, "CrossInitiated")
        .withArgs(
          RandomAddress,
          fakeTokenIn.address,
          RandomAddress,
          RandomAddress,
          31337,
          1337,
          1000000,
          1000000
        );
    });

    it("Should execute swap and bridge when required", async function () {
      /** Arrange */
      const { owner, anyoneElse } = await getAccounts();

      // Create two fake ERC20 tokens
      const fakeTokenIn = await fakeTokenContract();
      const fakeTokenOut = await fakeTokenContract();

      // Fake response from executed methods on the output token
      fakeTokenOut.balanceOf.returnsAtCall(0, 10);
      fakeTokenOut.balanceOf.returnsAtCall(1, 20);

      const [callDataSwap] = await zeroExEncodedCalldata();

      const callDataBridge = ethers.utils.defaultAbiCoder.encode(
        ["address"],
        [RandomAddress]
      );

      await providerUpdater
        .connect(owner)
        .updateSwapper([0, true, zeroEx.address, ZeroAddress]);

      await providerUpdater
        .connect(owner)
        .updateBridge([
          0,
          true,
          anyswap.address,
          "0x4f3aff3a747fcade12598081e80c6605a8be192f",
        ]);

      /** Act */
      const call = router
        .connect(anyoneElse)
        .initSwidge(
          1000000,
          [0, fakeTokenIn.address, fakeTokenOut.address, callDataSwap, true],
          [fakeTokenOut.address, 1337, callDataBridge, true],
          [RandomAddress, RandomAddress]
        );

      /** Assert */
      await expect(call)
        .to.emit(router, "CrossInitiated")
        .withArgs(
          fakeTokenIn.address,
          fakeTokenOut.address,
          RandomAddress,
          RandomAddress,
          31337,
          1337,
          1000000,
          10
        );
    });

    it("Should swap successfully from native token", async function () {
      /** Arrange */
      const { owner, anyoneElse } = await getAccounts();

      // Create two fake ERC20 tokens
      const fakeTokenOut = await fakeTokenContract();

      // Fake response from executed methods on the output token
      fakeTokenOut.balanceOf.returnsAtCall(0, 10);
      fakeTokenOut.balanceOf.returnsAtCall(1, 20);

      const [callData] = await zeroExEncodedCalldata();

      await providerUpdater
        .connect(owner)
        .updateSwapper([0, true, zeroEx.address, ZeroAddress]);

      const amountIn = ethers.utils.parseEther("1.0");

      /** Act */
      const call = router
        .connect(anyoneElse)
        .initSwidge(
          amountIn,
          [0, NativeToken, fakeTokenOut.address, callData, true],
          [RandomAddress, 1337, "0x", false],
          [RandomAddress, RandomAddress],
          {
            value: amountIn,
          }
        );

      /** Assert */
      await expect(call)
        .to.emit(router, "SwapExecuted")
        .withArgs(
          NativeToken,
          fakeTokenOut.address,
          31337,
          "1000000000000000000",
          10
        );
    });
  });

  describe("Swidge finalize process", () => {
    it("Should if anyone else than relayer is the caller", async function () {
      /** Arrange */
      const { owner, anyoneElse, relayer } = await getAccounts();
      await relaterUpdater.connect(owner).updateRelayer(relayer.address);

      /** Act */
      const call = router
        .connect(anyoneElse)
        .finalizeSwidge(1000000, RandomAddress, "txHash", [
          1,
          RandomAddress,
          RandomAddress,
          "0x",
          false,
        ]);

      /** Assert */
      await expect(call).to.be.revertedWith("Must be relayer");
    });

    it("Should execute the swap if relayer is the caller", async function () {
      /** Arrange */
      const { owner, relayer } = await getAccounts();
      await relaterUpdater.connect(owner).updateRelayer(relayer.address);

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
        .finalizeSwidge(1000000, RandomAddress, "txHash", [
          0,
          fakeTokenIn.address,
          fakeTokenOut.address,
          callData,
          true,
        ]);

      /** Assert */
      await expect(call)
        .to.emit(router, "CrossFinalized")
        .withArgs("txHash", 10);
    });

    it("Should revert if the provider fails", async function () {
      /** Arrange */
      const { owner, relayer } = await getAccounts();
      await relaterUpdater.connect(owner).updateRelayer(relayer.address);

      // Create two fake ERC20 tokens
      const fakeTokenIn = await fakeTokenContract();
      const fakeTokenOut = await fakeTokenContract();

      const [callData] = await zeroExEncodedCalldata();

      /** Act */
      const call = router
        .connect(relayer)
        .finalizeSwidge(1000000, RandomAddress, [
          0,
          fakeTokenIn.address,
          fakeTokenOut.address,
          callData,
          true,
        ]);

      /** Assert */
      await expect(call).to.be.reverted;
    });
  });

  it("Should fail if anyone else than the owner tries to retrieve", async function () {
    /** Arrange */
    const { anyoneElse } = await getAccounts();

    /** Act */
    const call = router.connect(anyoneElse).retrieve(RandomAddress, 1);

    /** Assert */
    await expect(call).to.be.reverted;
  });

  it("Should allow the owner to retrieve funds", async function () {
    /** Arrange */
    const { owner } = await getAccounts();
    const fakeToken = await fakeTokenContract();

    /** Act */
    await router.connect(owner).retrieve(fakeToken.address, 1);

    /** Assert */
    await expect(fakeToken.transfer).to.be.calledOnceWith(owner.address, 1);
  });
});
