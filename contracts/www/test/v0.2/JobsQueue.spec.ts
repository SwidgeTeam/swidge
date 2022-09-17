import chai, { expect } from "chai";
import { smock } from "@defi-wonderland/smock";
import { deployByName, fakeTokenContract, getAccounts } from "./shared";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { any } from "hardhat/internal/core/params/argumentTypes";
import { faker } from "@faker-js/faker";
import { createFakeContract } from "@defi-wonderland/smock/dist/src/factories/smock-contract";

chai.use(smock.matchers);

describe("Jobs Queue", () => {
  let core: Contract;

  beforeEach(async () => {
    const { owner } = await getAccounts();
    core = await deployByName("JobsQueue", owner);
  });

  it("should revert if caller not whitelisted", async () => {
    // Arrange
    const { anyoneElse } = await getAccounts();

    // Act
    const call = core.connect(anyoneElse).createJob("0x");

    // Assert
    expect(call).to.be.revertedWith("Unauthorized");
  });

  it("should be able to create job from whitelisted address", async () => {
    // Arrange
    const { owner, anyoneElse, random } = await getAccounts();
    await core.connect(owner).updateOrigins([anyoneElse.address]);
    const calldata = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address", "uint256", "uint256", "uint256"],
      [
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        1,
        1,
        1,
      ]
    );

    // Act
    await core.connect(anyoneElse).createJob(calldata);
    const jobs = await core.connect(random).getPendingJobs();

    // Assert
    expect(jobs.length).to.be.equal(1);
    expect(jobs[0].receiver).to.be.equal(ethers.constants.AddressZero);
    expect(jobs[0].inputAsset).to.be.equal(ethers.constants.AddressZero);
    expect(jobs[0].dstAsset).to.be.equal(ethers.constants.AddressZero);
    expect(jobs[0].dstChain).to.be.equal("1");
    expect(jobs[0].amountIn).to.be.equal("1");
    expect(jobs[0].minAmountOut).to.be.equal("1");
    expect(jobs[0].keep).to.be.equal(true);
  });

  describe("jobs array pruning", () => {
    beforeEach(async () => {
      const { owner, anyoneElse } = await getAccounts();
      await core.connect(owner).updateOrigins([anyoneElse.address]);
      const inputAsset = await fakeTokenContract();
      await createJob(core, anyoneElse, [
        faker.finance.ethereumAddress(),
        inputAsset.address,
        faker.finance.ethereumAddress(),
        1,
        100,
        90,
      ]);
      await createJob(core, anyoneElse, [
        faker.finance.ethereumAddress(),
        inputAsset.address,
        faker.finance.ethereumAddress(),
        1,
        100,
        90,
      ]);
      await createJob(core, anyoneElse, [
        faker.finance.ethereumAddress(),
        inputAsset.address,
        faker.finance.ethereumAddress(),
        1,
        100,
        90,
      ]);
    });

    it("should remain two jobs after executing one", async () => {
      // Arrange
      const { random } = await getAccounts();
      const jobsBefore = await core.connect(random).getPendingJobs();

      // Act
      await core
        .connect(random)
        .executeJobs([[jobsBefore[1], faker.finance.ethereumAddress(), "0x"]]);

      // Assert
      const jobsAfter = await core.connect(random).getPendingJobs();
      expect(jobsAfter.length).to.be.equal(2);
      expect(jobsAfter[0].position).to.be.equal(0);
      expect(jobsAfter[1].position).to.be.equal(1);
    });

    it("should remain one jobs after executing two", async () => {
      // Arrange
      const { random } = await getAccounts();
      const jobsBefore = await core.connect(random).getPendingJobs();

      // Act
      await core.connect(random).executeJobs([
        [jobsBefore[0], faker.finance.ethereumAddress(), "0x"],
        [jobsBefore[1], faker.finance.ethereumAddress(), "0x"],
      ]);

      // Assert
      const jobsAfter = await core.connect(random).getPendingJobs();
      expect(jobsAfter.length).to.be.equal(1);
      expect(jobsAfter[0].position).to.be.equal(0);
    });

    it("should remain no jobs after executing three", async () => {
      // Arrange
      const { random } = await getAccounts();
      const jobsBefore = await core.connect(random).getPendingJobs();

      // Act
      await core.connect(random).executeJobs([
        [jobsBefore[0], faker.finance.ethereumAddress(), "0x"],
        [jobsBefore[1], faker.finance.ethereumAddress(), "0x"],
        [jobsBefore[2], faker.finance.ethereumAddress(), "0x"],
      ]);

      // Assert
      const jobsAfter = await core.connect(random).getPendingJobs();
      expect(jobsAfter.length).to.be.equal(0);
    });
  });
});

async function createJob(core: Contract, origin: Signer, args: any) {
  const calldata = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address", "uint256", "uint256", "uint256"],
    args
  );
  await core.connect(origin).createJob(calldata);
}
