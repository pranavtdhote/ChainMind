import { expect } from "chai";
import hre from "hardhat";

describe("AgentRegistry Smart Contract Tests", function () {
  let agentRegistry;
  let owner;
  let agent1;
  let agent2;
  let unauthorizedCaller;

  beforeEach(async function () {
    // Get signers
    [owner, agent1, agent2, unauthorizedCaller] = await hre.ethers.getSigners();

    // Deploy AgentRegistry
    const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();
    await agentRegistry.waitForDeployment();
  });

  describe("Agent Registration", function () {
    it("Should successfully register a new agent", async function () {
      const tx = await agentRegistry.connect(agent1).registerAgent(
        "Agent-X",
        "Developer",
        "Scans smart contracts for reentrancy bugs",
        ["Solidity", "AST Checking"],
        "ipfs://avatar-seed"
      );

      // Verify event emission
      await expect(tx)
        .to.emit(agentRegistry, "AgentRegistered")
        .withArgs(agent1.address, "Agent-X", "Developer", "ipfs://avatar-seed");

      // Verify state variables on-chain
      const profile = await agentRegistry.getAgent(agent1.address);
      expect(profile.wallet).to.equal(agent1.address);
      expect(profile.name).to.equal("Agent-X");
      expect(profile.role).to.equal("Developer");
      expect(profile.reputation).to.equal(100n);
      expect(profile.status).to.equal("Online");
    });

    it("Should reject duplicate registration", async function () {
      await agentRegistry.connect(agent1).registerAgent(
        "Agent-X",
        "Developer",
        "Mock Description",
        ["Skills"],
        "ipfs://avatar"
      );

      await expect(
        agentRegistry.connect(agent1).registerAgent(
          "Agent-X-2",
          "Developer",
          "Mock Description 2",
          ["Skills 2"],
          "ipfs://avatar-2"
        )
      ).to.be.revertedWith("AgentRegistry: Agent already registered");
    });

    it("Should reject registration with empty name or role", async function () {
      await expect(
        agentRegistry.connect(agent1).registerAgent(
          "",
          "Developer",
          "Mock Description",
          ["Skills"],
          "ipfs://avatar"
        )
      ).to.be.revertedWith("AgentRegistry: Name cannot be empty");

      await expect(
        agentRegistry.connect(agent1).registerAgent(
          "Agent-X",
          "",
          "Mock Description",
          ["Skills"],
          "ipfs://avatar"
        )
      ).to.be.revertedWith("AgentRegistry: Role cannot be empty");
    });
  });

  describe("Agent profile Updates & Status Changes", function () {
    beforeEach(async function () {
      await agentRegistry.connect(agent1).registerAgent(
        "Agent-X",
        "Developer",
        "Original description",
        ["Skills"],
        "ipfs://avatar"
      );
    });

    it("Should allow registered agent to update their profile", async function () {
      const tx = await agentRegistry.connect(agent1).updateAgent(
        "Agent-X-Updated",
        "Lead Developer",
        "New description",
        ["Solidity", "Fuzzing"],
        "ipfs://avatar-new"
      );

      await expect(tx)
        .to.emit(agentRegistry, "AgentUpdated")
        .withArgs(agent1.address, "Agent-X-Updated", "Lead Developer", "ipfs://avatar-new");

      const profile = await agentRegistry.getAgent(agent1.address);
      expect(profile.name).to.equal("Agent-X-Updated");
      expect(profile.role).to.equal("Lead Developer");
    });

    it("Should reject updates from unregistered wallets", async function () {
      await expect(
        agentRegistry.connect(agent2).updateAgent(
          "Agent-2",
          "Developer",
          "New description",
          ["Skills"],
          "ipfs://avatar"
        )
      ).to.be.revertedWith("AgentRegistry: Agent not registered");
    });

    it("Should allow registered agent to change status", async function () {
      const tx = await agentRegistry.connect(agent1).changeStatus("Active Project");

      await expect(tx)
        .to.emit(agentRegistry, "StatusChanged")
        .withArgs(agent1.address, "Active Project");

      const profile = await agentRegistry.getAgent(agent1.address);
      expect(profile.status).to.equal("Active Project");
    });
  });

  describe("Reputation and Performance Stats Updates", function () {
    beforeEach(async function () {
      await agentRegistry.connect(agent1).registerAgent(
        "Agent-X",
        "Developer",
        "Description",
        ["Skills"],
        "ipfs://avatar"
      );
    });

    it("Should allow contract owner (authorized by default) to reward reputation", async function () {
      // Increase reputation by 10
      await agentRegistry.connect(owner).increaseReputation(agent1.address, 10);
      let profile = await agentRegistry.getAgent(agent1.address);
      expect(profile.reputation).to.equal(110n);

      // Decrease reputation by 20
      await agentRegistry.connect(owner).decreaseReputation(agent1.address, 20);
      profile = await agentRegistry.getAgent(agent1.address);
      expect(profile.reputation).to.equal(90n);
    });

    it("Should allow authorized caller contracts to update reputation and stats", async function () {
      // Authorize a mockup address (using agent2 as dummy validator contract)
      await agentRegistry.connect(owner).setCallerAuthorization(agent2.address, true);

      // Call statistic updates using authorized sender
      await agentRegistry.connect(agent2).increaseReputation(agent1.address, 5);
      await agentRegistry.connect(agent2).incrementTask(agent1.address);
      await agentRegistry.connect(agent2).incrementVerification(agent1.address);
      await agentRegistry.connect(agent2).incrementMemory(agent1.address);

      const profile = await agentRegistry.getAgent(agent1.address);
      expect(profile.reputation).to.equal(105n);
      expect(profile.completedTasks).to.equal(1n);
      expect(profile.verificationCount).to.equal(1n);
      expect(profile.memoryCount).to.equal(1n);
    });

    it("Should reject reputation edits from unauthorized callers", async function () {
      await expect(
        agentRegistry.connect(unauthorizedCaller).increaseReputation(agent1.address, 10)
      ).to.be.revertedWith("AgentRegistry: Caller not authorized");
    });
  });
});
