import {ethers} from "hardhat";
import chai, {expect} from "chai";
import {fakeTokenContract, RandomAddress, ZeroAddress} from "../../shared";
import {Contract, ContractFactory} from "ethers";
import {FakeContract, smock} from "@defi-wonderland/smock";

chai.use(smock.matchers);

describe('Multichain', () => {
    let AnyswapFactory: ContractFactory;
    let contract: Contract;
    let providerContract: FakeContract;

    beforeEach(async () => {
        AnyswapFactory = await ethers.getContractFactory("Anyswap");
        const [owner] = await ethers.getSigners();
        providerContract = await fakeMultichainContract();
        contract = await AnyswapFactory.connect(owner).deploy(providerContract.address);
    });

    it("Should fail if anyone else than the owner tries to update the router address", async function () {
        /** Arrange */
        const [owner, anyoneElse, random] = await ethers.getSigners();

        /** Act */
        const call = contract
            .connect(anyoneElse)
            .updateRouter(random.address)

        /** Assert */
        await expect(call).to.be.reverted;
    });

    it("Should fail if the new router address is ZeroAddress", async function () {
        /** Arrange */
        const [owner] = await ethers.getSigners();

        /** Act */
        const call = contract
            .connect(owner)
            .updateRouter(ZeroAddress);

        /** Assert */
        await expect(call).to.be.reverted;
    });

    it("Should emit an event when the router is successfully updated", async function () {
        /** Arrange */
        const [owner, anyoneElse, random] = await ethers.getSigners();

        /** Act */
        const call = contract
            .connect(owner)
            .updateRouter(random.address);

        /** Assert */
        await expect(call)
            .to.emit(contract, 'UpdatedRouter')
            .withArgs(ZeroAddress, random.address);
    });

    it("Should fail to execute if the caller is not the router", async function () {
        /** Arrange */
        const [owner, anyoneElse, router] = await ethers.getSigners();
        await contract
            .connect(owner)
            .updateRouter(router.address);

        /** Act */
        const call = contract
            .connect(anyoneElse)
            .send(
                RandomAddress,
                router.address,
                1000000,
                1337,
                '0x',
            );

        /** Assert */
        await expect(call).to.revertedWith('Unauthorized caller');
    });

    it("Should revert if provider fails the execution", async function () {
        /** Arrange */
        const [owner, anyoneElse, router] = await ethers.getSigners();
        await contract
            .connect(owner)
            .updateRouter(router.address);

        // Create to fake ERC20 tokens
        const fakeTokenIn = await fakeTokenContract();

        // Generate random bytes for function payload
        const callData = ethers.utils.defaultAbiCoder.encode(['address'], [RandomAddress]);

        // Set the provider response to fail
        providerContract.anySwapOutUnderlying.reverts();

        /** Act */
        const call = contract
            .connect(router)
            .send(
                fakeTokenIn.address,
                router.address,
                1000000,
                1337,
                callData,
            );

        /** Assert */
        await expect(call).to.be.reverted;
    });

    it("Should execute correctly and send right parameters", async function () {
        /** Arrange */
        const [owner, anyoneElse, router] = await ethers.getSigners();
        await contract
            .connect(owner)
            .updateRouter(router.address);

        // Create to fake ERC20 tokens
        const fakeTokenIn = await fakeTokenContract();

        // Generate random bytes for function payload
        const callData = ethers.utils.defaultAbiCoder.encode(['address'], [RandomAddress]);

        /** Act */
        await contract
            .connect(router)
            .send(
                fakeTokenIn.address,
                router.address,
                1000000,
                1337,
                callData,
            );

        /** Assert */
        await expect(providerContract.anySwapOutUnderlying)
            .to.be.calledOnceWith(
                RandomAddress,
                router.address,
                1000000,
                1337
            );
    });
});

async function fakeMultichainContract() {
    const abi = [
        "function anySwapOutUnderlying(address token, address to, uint amount, uint toChainID) external",
    ];
    return await smock.fake(abi);
}
