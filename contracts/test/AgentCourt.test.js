import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("AgentCourt Registry Contracts", function () {
  let VerificationRegistry, verificationRegistry;
  let CollaborationRegistry, collaborationRegistry;
  let owner, auditor1, auditor2, auditor3;

  beforeEach(async function () {
    [owner, auditor1, auditor2, auditor3] = await ethers.getSigners();

    VerificationRegistry = await ethers.getContractFactory("VerificationRegistry");
    verificationRegistry = await VerificationRegistry.deploy();

    CollaborationRegistry = await ethers.getContractFactory("CollaborationRegistry");
    collaborationRegistry = await CollaborationRegistry.deploy();
  });

  describe("CollaborationRegistry Operations", function () {
    it("should successfully create a project space", async function () {
      const tx = await collaborationRegistry.createProject("Monad DeFi aggregator", "QmMetadata");
      await tx.wait();

      const count = await collaborationRegistry.getProjectCount();
      expect(count).to.equal(1);
    });

    it("should allow project owner to add participant agents", async function () {
      const tx = await collaborationRegistry.createProject("Cross-chain liquidity bridge", "QmMetadata");
      const receipt = await tx.wait();
      
      const event = receipt.logs.map(log => {
        try {
          return collaborationRegistry.interface.parseLog(log);
        } catch {
          return null;
        }
      }).find(e => e && e.name === "ProjectCreated");

      const projectId = event.args.projectId;

      await collaborationRegistry.addAgentToProject(projectId, auditor1.address, "Research");
      const participants = await collaborationRegistry.getProjectParticipants(projectId);
      
      expect(participants.length).to.equal(1);
      expect(participants[0]).to.equal(auditor1.address);
    });
  });

  describe("VerificationRegistry Voting & Finalization", function () {
    it("should initiate verification and calculate consensus", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task_1"));
      const reportCid = "QmVerificationReportHash123456";

      const initTx = await verificationRegistry.initiateVerification(taskId, reportCid);
      const receipt = await initTx.wait();

      const event = receipt.logs.map(log => {
        try {
          return verificationRegistry.interface.parseLog(log);
        } catch {
          return null;
        }
      }).find(e => e && e.name === "VerificationStarted");

      const caseId = event.args.caseId;

      await verificationRegistry.connect(auditor1).submitVote(caseId, true);
      await verificationRegistry.connect(auditor2).submitVote(caseId, true);
      await verificationRegistry.connect(auditor3).submitVote(caseId, false);

      await verificationRegistry.finalizeCase(caseId, "QmCourtReport", 75, 80, 85);

      const vCase = await verificationRegistry.cases(caseId);
      expect(vCase.consensusScore).to.equal(75);
      expect(vCase.status).to.equal(1); // 1 = Approved
    });

    it("should reject verification case if consensus is below 75%", async function () {
      const taskId = ethers.keccak256(ethers.toUtf8Bytes("task_2"));
      const reportCid = "QmRejectedReportHash123456";

      const initTx = await verificationRegistry.initiateVerification(taskId, reportCid);
      const receipt = await initTx.wait();

      const event = receipt.logs.map(log => {
        try {
          return verificationRegistry.interface.parseLog(log);
        } catch {
          return null;
        }
      }).find(e => e && e.name === "VerificationStarted");

      const caseId = event.args.caseId;

      await verificationRegistry.connect(auditor1).submitVote(caseId, true);
      await verificationRegistry.connect(auditor2).submitVote(caseId, false);

      await verificationRegistry.finalizeCase(caseId, "QmCourtReport", 50, 60, 55);

      const vCase = await verificationRegistry.cases(caseId);
      expect(vCase.consensusScore).to.equal(50);
      expect(vCase.status).to.equal(2); // 2 = Rejected
    });
  });
});
