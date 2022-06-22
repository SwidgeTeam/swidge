import chai, { expect } from "chai";
import { ethers } from "hardhat";
import {
  fakeTokenContract,
  getAccounts,
  RandomAddress,
  zeroExEncodedCalldata,
} from "../shared";
import { Contract } from "ethers";
import { smock } from "@defi-wonderland/smock";
const { deployDiamond, deployFacets } = require("../../scripts/deploy");

chai.use(smock.matchers);

describe("RouterFacet", function () {
  let providerUpdater: Contract;
  let router: Contract;

  beforeEach(async () => {
    const { owner } = await getAccounts();
    const [diamondProxy] = await deployDiamond(ethers, owner);
    await deployFacets(ethers, owner, diamondProxy.address);
    providerUpdater = await ethers.getContractAt(
      "ProviderUpdaterFacet",
      diamondProxy.address
    );
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

      // Deploy fake providers
      const mockAnyswapContract = await mockAnyswap();
      const mockZeroExContract = await mockZeroEx();

      // Update providers' router address
      await mockAnyswapContract.connect(owner).updateRouter(router.address);
      await mockZeroExContract.connect(owner).updateRouter(router.address);

      // Set providers on router
      await providerUpdater
        .connect(owner)
        .updateBridgeProvider(0, mockAnyswapContract.address);
      await providerUpdater
        .connect(owner)
        .updateSwapProvider(0, mockZeroExContract.address);

      // Create two fake ERC20 tokens
      const fakeTokenIn = await fakeTokenContract();
      const fakeTokenOut = await fakeTokenContract();

      // Fake response from executed methods on the output token
      fakeTokenOut.balanceOf.returnsAtCall(0, 10);
      fakeTokenOut.balanceOf.returnsAtCall(1, 20);

      const [callData] = await zeroExEncodedCalldata();

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

      await expect(mockZeroExContract.swap).to.be.calledOnceWith(
        fakeTokenIn.address,
        fakeTokenOut.address,
        router.address,
        1000000,
        callData
      );
    });

    it("Should only execute bridge if no swapping step is required", async function () {
      /** Arrange */
      const { owner, anyoneElse } = await getAccounts();

      // Deploy fake providers
      const mockAnyswapContract = await mockAnyswap();
      const mockZeroExContract = await mockZeroEx();

      // Update providers' router address
      await mockAnyswapContract.connect(owner).updateRouter(router.address);
      await mockZeroExContract.connect(owner).updateRouter(router.address);

      // Set providers on router
      await providerUpdater
        .connect(owner)
        .updateBridgeProvider(0, mockAnyswapContract.address);
      await providerUpdater
        .connect(owner)
        .updateSwapProvider(0, mockZeroExContract.address);

      // Create two fake ERC20 tokens
      const fakeTokenIn = await fakeTokenContract();

      const callData = ethers.utils.defaultAbiCoder.encode(
        ["address"],
        [RandomAddress]
      );

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

      await expect(mockAnyswapContract.send).to.be.calledOnceWith(
        fakeTokenIn.address,
        router.address,
        1000000,
        1337,
        callData
      );
    });

    it("Should execute swap and bridge when required", async function () {
      /** Arrange */
      const { owner, anyoneElse } = await getAccounts();

      // Deploy fake providers
      const mockAnyswapContract = await mockAnyswap();
      const mockZeroExContract = await mockZeroEx();

      // Update providers' router address
      await mockAnyswapContract.connect(owner).updateRouter(router.address);
      await mockZeroExContract.connect(owner).updateRouter(router.address);

      // Set providers on router
      await providerUpdater
        .connect(owner)
        .updateBridgeProvider(0, mockAnyswapContract.address);
      await providerUpdater
        .connect(owner)
        .updateSwapProvider(0, mockZeroExContract.address);

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

      await expect(mockZeroExContract.swap).to.be.calledOnceWith(
        fakeTokenIn.address,
        fakeTokenOut.address,
        router.address,
        1000000,
        callDataSwap
      );

      await expect(mockAnyswapContract.send).to.be.calledOnceWith(
        fakeTokenOut.address,
        router.address,
        10,
        1337,
        callDataBridge
      );
    });
  });

  describe("Swidge finalize process", () => {
    it("Should if anyone else than relayer is the caller", async function () {
      /** Arrange */
      const { owner, anyoneElse, relayer } = await getAccounts();
      await providerUpdater.connect(owner).updateRelayer(relayer.address);

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
      await expect(call).to.be.revertedWith("Caller is not the relayer");
    });

    it("Should execute the swap if relayer is the caller", async function () {
      /** Arrange */
      const { owner, relayer } = await getAccounts();
      await providerUpdater.connect(owner).updateRelayer(relayer.address);

      // Deploy fake provider
      const mockZeroExContract = await mockZeroEx();

      // Update provider's router address
      await mockZeroExContract.connect(owner).updateRouter(router.address);

      // Set provider on router
      await providerUpdater
        .connect(owner)
        .updateSwapProvider(0, mockZeroExContract.address);

      // Create two fake ERC20 tokens
      const fakeTokenIn = await fakeTokenContract();
      const fakeTokenOut = await fakeTokenContract();

      // Fake response from executed methods on the output token
      fakeTokenOut.balanceOf.returnsAtCall(0, 10);
      fakeTokenOut.balanceOf.returnsAtCall(1, 20);

      const [callData] = await zeroExEncodedCalldata();

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

      await expect(mockZeroExContract.swap).to.be.calledOnceWith(
        fakeTokenIn.address,
        fakeTokenOut.address,
        router.address,
        1000000,
        callData
      );
    });

    it("Should revert if the provider fails", async function () {
      /** Arrange */
      const { owner, relayer } = await getAccounts();
      await providerUpdater.connect(owner).updateRelayer(relayer.address);

      // Deploy fake provider
      const mockZeroExContract = await mockZeroEx();

      // Update provider's router address
      await mockZeroExContract.connect(owner).updateRouter(router.address);

      // Set provider on router
      await providerUpdater
        .connect(owner)
        .updateSwapProvider(0, mockZeroExContract.address);

      // Create two fake ERC20 tokens
      const fakeTokenIn = await fakeTokenContract();
      const fakeTokenOut = await fakeTokenContract();

      mockZeroExContract.swap.reverts();

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

async function mockAnyswap() {
  const RouterFactory = await smock.mock("Anyswap");
  const { owner } = await getAccounts();
  const someContract = await fakeTokenContract();
  return await RouterFactory.connect(owner).deploy(someContract.address);
}

async function mockZeroEx() {
  const RouterFactory = await smock.mock("ZeroEx");
  const { owner } = await getAccounts();
  return await RouterFactory.connect(owner).deploy();
}
