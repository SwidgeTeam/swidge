import chai, {expect} from "chai";
import {ethers} from "hardhat";
import {fakeTokenContract, RandomAddress, ZeroAddress, zeroExEncodedCalldata} from "./shared";
import {Contract, ContractFactory} from "ethers";
import {smock} from "@defi-wonderland/smock";

chai.use(smock.matchers);

describe("Router", function () {
    let RouterFactory: ContractFactory;
    let contract: Contract;

    beforeEach(async () => {
        RouterFactory = await ethers.getContractFactory("Router");
        const [owner] = await ethers.getSigners();
        contract = await RouterFactory.connect(owner).deploy();
    });

    describe('Update Events', () => {

        describe('Update Relayer', () => {
            it("Should fail if anyone else than the owner tries to update the relayer", async function () {
                /** Arrange */
                const [owner, anyoneElse, random] = await ethers.getSigners();

                /** Act */
                const call = contract.connect(anyoneElse).updateRelayer(random.address);

                /** Assert */
                await expect(call).to.be.reverted;
            });

            it("Should fail if the new relayer address is ZeroAddress", async function () {
                /** Arrange */
                const [owner] = await ethers.getSigners();

                /** Act */
                const call = contract.connect(owner).updateRelayer(ZeroAddress);

                /** Assert */
                await expect(call).to.be.reverted;
            });

            it("Should emit an event when the relayer is successfully updated", async function () {
                /** Arrange */
                const [owner, anyoneElse, random] = await ethers.getSigners();

                /** Act */
                const call = contract.connect(owner).updateRelayer(random.address);

                /** Assert */
                await expect(call)
                    .to.emit(contract, 'UpdatedRelayer')
                    .withArgs(ZeroAddress, random.address);
            });
        });

        describe('Updated Bridge Provider', () => {
            it("Should fail if anyone else than the owner tries to update a bridge provider address", async function () {
                /** Arrange */
                const [owner, anyoneElse, random] = await ethers.getSigners();

                /** Act */
                const call = contract.connect(anyoneElse).updateBridgeProvider(0, random.address);

                /** Assert */
                await expect(call).to.be.reverted;
            });

            it("Should fail if the new bridge provider address is ZeroAddress", async function () {
                /** Arrange */
                const [owner] = await ethers.getSigners();

                /** Act */
                const call = contract.connect(owner).updateBridgeProvider(0, ZeroAddress);

                /** Assert */
                await expect(call).to.be.reverted;
            });

            it("Should emit an event when the bridge provider is successfully updated", async function () {
                /** Arrange */
                const [owner, anyoneElse, random] = await ethers.getSigners();

                /** Act */
                const call = contract.connect(owner).updateBridgeProvider(0, random.address);

                /** Assert */
                await expect(call)
                    .to.emit(contract, 'UpdatedBridgeProvider')
                    .withArgs(0, random.address);
            });
        });

        describe('Updated Swap Provider', () => {
            it("Should fail if anyone else than the owner tries to update a swap provider address", async function () {
                /** Arrange */
                const [owner, anyoneElse, random] = await ethers.getSigners();

                /** Act */
                const call = contract.connect(anyoneElse).updateSwapProvider(0, random.address);

                /** Assert */
                await expect(call).to.be.reverted;
            });

            it("Should fail if the new swap provider address is ZeroAddress", async function () {
                /** Arrange */
                const [owner] = await ethers.getSigners();

                /** Act */
                const call = contract.connect(owner).updateSwapProvider(0, ZeroAddress);

                /** Assert */
                await expect(call).to.be.reverted;
            });

            it("Should emit an event when the swap provider is successfully updated", async function () {
                /** Arrange */
                const [owner, anyoneElse, random] = await ethers.getSigners();

                /** Act */
                const call = contract.connect(owner).updateSwapProvider(0, random.address);

                /** Assert */
                await expect(call)
                    .to.emit(contract, 'UpdatedSwapProvider')
                    .withArgs(0, random.address);
            });
        });

    });

    describe('Swidge init process', () => {
        it("Should revert if no swap nor bridge step is required", async function () {
            /** Arrange */
            const [owner, anyoneElse] = await ethers.getSigners();

            /** Act */
            const call = contract.connect(anyoneElse).initSwidge(
                1000000,
                [
                    0,
                    RandomAddress,
                    RandomAddress,
                    '0x',
                    false
                ],
                [
                    RandomAddress,
                    57,
                    '0x',
                    false
                ],
                [
                    RandomAddress,
                    RandomAddress,
                ]
            );

            /** Assert */
            await expect(call).to.be.revertedWith('No required actions');
        });

        it("Should only execute swap if no bridging step is required", async function () {
            /** Arrange */
            const [owner, anyoneElse] = await ethers.getSigners();

            // Deploy fake providers
            const mockAnyswapContract = await mockAnyswap();
            const mockZeroExContract = await mockZeroEx();

            // Update providers' router address
            await mockAnyswapContract.connect(owner).updateRouter(contract.address);
            await mockZeroExContract.connect(owner).updateRouter(contract.address);

            // Set providers on router
            await contract.connect(owner).updateBridgeProvider(0, mockAnyswapContract.address);
            await contract.connect(owner).updateSwapProvider(0, mockZeroExContract.address);

            // Create two fake ERC20 tokens
            const fakeTokenIn = await fakeTokenContract();
            const fakeTokenOut = await fakeTokenContract();

            // Fake response from executed methods on the output token
            fakeTokenOut.balanceOf.returnsAtCall(0, 10);
            fakeTokenOut.balanceOf.returnsAtCall(1, 20);

            const [callData] = await zeroExEncodedCalldata();

            /** Act */
            const call = contract
                .connect(anyoneElse)
                .initSwidge(
                    1000000,
                    [
                        0,
                        fakeTokenIn.address,
                        fakeTokenOut.address,
                        callData,
                        true
                    ],
                    [
                        RandomAddress,
                        1337,
                        '0x',
                        false
                    ],
                    [
                        RandomAddress,
                        RandomAddress,
                    ]
                );

            /** Assert */
            await expect(call)
                .to.emit(contract, 'SwapExecuted')
                .withArgs(
                    fakeTokenIn.address,
                    fakeTokenOut.address,
                    31337,
                    1000000,
                    10
                );

            await expect(mockZeroExContract.swap)
                .to.be.calledOnceWith(
                    fakeTokenIn.address,
                    fakeTokenOut.address,
                    contract.address,
                    1000000,
                    callData
                );
        });

        it("Should only execute bridge if no swapping step is required", async function () {
            /** Arrange */
            const [owner, anyoneElse] = await ethers.getSigners();

            // Deploy fake providers
            const mockAnyswapContract = await mockAnyswap();
            const mockZeroExContract = await mockZeroEx();

            // Update providers' router address
            await mockAnyswapContract.connect(owner).updateRouter(contract.address);
            await mockZeroExContract.connect(owner).updateRouter(contract.address);

            // Set providers on router
            await contract.connect(owner).updateBridgeProvider(0, mockAnyswapContract.address);
            await contract.connect(owner).updateSwapProvider(0, mockZeroExContract.address);

            // Create two fake ERC20 tokens
            const fakeTokenIn = await fakeTokenContract();

            const callData = ethers.utils.defaultAbiCoder.encode(['address'], [RandomAddress]);

            /** Act */
            const call = contract
                .connect(anyoneElse)
                .initSwidge(
                    1000000,
                    [
                        0,
                        RandomAddress,
                        RandomAddress,
                        '0x',
                        false
                    ],
                    [
                        fakeTokenIn.address,
                        1337,
                        callData,
                        true
                    ],
                    [
                        RandomAddress,
                        RandomAddress,
                    ]
                );

            /** Assert */
            await expect(call)
                .to.emit(contract, 'CrossInitiated')
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

            await expect(mockAnyswapContract.send)
                .to.be.calledOnceWith(
                    fakeTokenIn.address,
                    contract.address,
                    1000000,
                    1337,
                    callData
                );
        });

        it("Should execute swap and bridge when required", async function () {
            /** Arrange */
            const [owner, anyoneElse] = await ethers.getSigners();

            // Deploy fake providers
            const mockAnyswapContract = await mockAnyswap();
            const mockZeroExContract = await mockZeroEx();

            // Update providers' router address
            await mockAnyswapContract.connect(owner).updateRouter(contract.address);
            await mockZeroExContract.connect(owner).updateRouter(contract.address);

            // Set providers on router
            await contract.connect(owner).updateBridgeProvider(0, mockAnyswapContract.address);
            await contract.connect(owner).updateSwapProvider(0, mockZeroExContract.address);

            // Create two fake ERC20 tokens
            const fakeTokenIn = await fakeTokenContract();
            const fakeTokenOut = await fakeTokenContract();

            // Fake response from executed methods on the output token
            fakeTokenOut.balanceOf.returnsAtCall(0, 10);
            fakeTokenOut.balanceOf.returnsAtCall(1, 20);

            const [callDataSwap] = await zeroExEncodedCalldata();

            const callDataBridge = ethers.utils.defaultAbiCoder.encode(['address'], [RandomAddress]);

            /** Act */
            const call = contract
                .connect(anyoneElse)
                .initSwidge(
                    1000000,
                    [
                        0,
                        fakeTokenIn.address,
                        fakeTokenOut.address,
                        callDataSwap,
                        true
                    ],
                    [
                        fakeTokenOut.address,
                        1337,
                        callDataBridge,
                        true
                    ],
                    [
                        RandomAddress,
                        RandomAddress,
                    ]
                );

            /** Assert */
            await expect(call)
                .to.emit(contract, 'CrossInitiated')
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

            await expect(mockZeroExContract.swap)
                .to.be.calledOnceWith(
                    fakeTokenIn.address,
                    fakeTokenOut.address,
                    contract.address,
                    1000000,
                    callDataSwap
                );

            await expect(mockAnyswapContract.send)
                .to.be.calledOnceWith(
                    fakeTokenOut.address,
                    contract.address,
                    10,
                    1337,
                    callDataBridge
                );
        });
    });

    describe('Swidge finalize process', () => {
        it("Should if anyone else than relayer is the caller", async function () {
            /** Arrange */
            const [owner, anyoneElse, relayer] = await ethers.getSigners();
            await contract.connect(owner).updateRelayer(relayer.address);

            /** Act */
            const call = contract.connect(anyoneElse).finalizeSwidge(
                1000000,
                RandomAddress,
                'txHash',
                [
                    1,
                    RandomAddress,
                    RandomAddress,
                    '0x',
                    false
                ],
            );

            /** Assert */
            await expect(call).to.be.revertedWith('Caller is not the relayer');
        });

        it("Should execute the swap if relayer is the caller", async function () {
            /** Arrange */
            const [owner, anyoneElse, relayer] = await ethers.getSigners();
            await contract
                .connect(owner)
                .updateRelayer(relayer.address);

            // Deploy fake provider
            const mockZeroExContract = await mockZeroEx();

            // Update provider's router address
            await mockZeroExContract.connect(owner).updateRouter(contract.address);

            // Set provider on router
            await contract.connect(owner).updateSwapProvider(0, mockZeroExContract.address);

            // Create two fake ERC20 tokens
            const fakeTokenIn = await fakeTokenContract();
            const fakeTokenOut = await fakeTokenContract();

            // Fake response from executed methods on the output token
            fakeTokenOut.balanceOf.returnsAtCall(0, 10);
            fakeTokenOut.balanceOf.returnsAtCall(1, 20);

            const [callData] = await zeroExEncodedCalldata();

            /** Act */
            const call = contract
                .connect(relayer)
                .finalizeSwidge(
                    1000000,
                    RandomAddress,
                    'txHash',
                    [
                        0,
                        fakeTokenIn.address,
                        fakeTokenOut.address,
                        callData,
                        true
                    ],
                );

            /** Assert */
            await expect(call)
                .to.emit(contract, 'CrossFinalized')
                .withArgs('txHash', 10);

            await expect(mockZeroExContract.swap)
                .to.be.calledOnceWith(
                    fakeTokenIn.address,
                    fakeTokenOut.address,
                    contract.address,
                    1000000,
                    callData
                );
        });

        it("Should revert if the provider fails", async function () {
            /** Arrange */
            const [owner, anyoneElse, relayer] = await ethers.getSigners();
            await contract
                .connect(owner)
                .updateRelayer(relayer.address);

            // Deploy fake provider
            const mockZeroExContract = await mockZeroEx();

            // Update provider's router address
            await mockZeroExContract.connect(owner).updateRouter(contract.address);

            // Set provider on router
            await contract.connect(owner).updateSwapProvider(0, mockZeroExContract.address);

            // Create two fake ERC20 tokens
            const fakeTokenIn = await fakeTokenContract();
            const fakeTokenOut = await fakeTokenContract();

            mockZeroExContract.swap.reverts();

            const [callData] = await zeroExEncodedCalldata();

            /** Act */
            const call = contract
                .connect(relayer)
                .finalizeSwidge(
                    1000000,
                    RandomAddress,
                    [
                        0,
                        fakeTokenIn.address,
                        fakeTokenOut.address,
                        callData,
                        true
                    ],
                );

            /** Assert */
            await expect(call).to.be.reverted;
        });
    });

    it("Should fail if anyone else than the owner tries to retrieve", async function () {
        /** Arrange */
        const [owner, anyoneElse] = await ethers.getSigners();

        /** Act */
        const call = contract
            .connect(anyoneElse)
            .retrieve(RandomAddress, 1);

        /** Assert */
        await expect(call).to.be.reverted;
    });

    it("Should allow the owner to retrieve funds", async function () {
        /** Arrange */
        const [owner] = await ethers.getSigners();
        const fakeToken = await fakeTokenContract();

        /** Act */
        await contract
            .connect(owner)
            .retrieve(fakeToken.address, 1);

        /** Assert */
        await expect(fakeToken.transfer)
            .to.be.calledOnceWith(
                owner.address,
                1
            );
    });
});

async function mockAnyswap() {
    const RouterFactory = await smock.mock("Anyswap");
    const [owner] = await ethers.getSigners();
    const someContract = await fakeTokenContract();
    return await RouterFactory.connect(owner).deploy(someContract.address);
}

async function mockZeroEx() {
    const RouterFactory = await smock.mock("ZeroEx");
    const [owner] = await ethers.getSigners();
    return await RouterFactory.connect(owner).deploy();
}