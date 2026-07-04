import mongoose from "mongoose";
import dotenv from "dotenv";
import { MemoryEngine } from "../MemoryEngine";
import { VersionService } from "../VersionService";
import { SharedContext } from "../../types/orchestrator";
import { MemoryPassportModel } from "../../models/MemoryPassport";
import { VersionModel } from "../../models/Version";
import { connectDB } from "../../config/db";

// Load configurations
dotenv.config();

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING CHAINMIND MEMORY ENGINE & VERSION TEST SUITE");
  console.log("==================================================\n");

  // Connect to DB
  await connectDB();

  // Clean up existing test indexes
  console.log("[Setup]: Clearing historical test records...");
  await MemoryPassportModel.deleteMany({ projectName: "Test Memory Project" });
  await VersionModel.deleteMany({});
  console.log("✔ Clean complete!\n");

  const ownerWallet = "0x892a014aef37b12dcf012a45ebfa89018bc79e8c";

  // 1. Initial State Context (V1)
  console.log("[Test 1]: Simulating Swarm V1 (Research + Developer)...");
  const contextV1: SharedContext = {
    projectName: "Test Memory Project",
    userGoal: "Build a cross-chain liquidity aggregator",
    requirements: ["Deploy smart contracts on Monad", "Implement liquid pools"],
    currentTask: "Complete Initial Compilation",
    completedTasks: ["Research", "Developer"],
    pendingTasks: ["UI Designer", "Verifier"],
    researchOutput: {
      recommendations: ["Select HSL custom style system tokens"],
      architecture: { pattern: "Modular Controller Pattern", components: ["VaultRouter", "LiquidityBridge"], dataFlow: ["VaultRouter -> LiquidityBridge"] },
      libraries: ["ethers@6.x", "framer-motion"],
    },
    developerOutput: {
      implementationSummary: "Contracts and API controller files created successfully.",
      generatedModules: [
        { moduleName: "VaultRouter", filePath: "contracts/VaultRouter.sol", code: "contract VaultRouter { ... }" }
      ],
    },
    agentHistory: [
      { agentId: "agent_research", agentName: "Research Agent", role: "Research", action: "Completed research", timestamp: Date.now() - 5000 },
      { agentId: "agent_developer", agentName: "Developer Agent", role: "Developer", action: "Completed coding modules", timestamp: Date.now() }
    ],
    currentStatus: "Completed",
    timestamp: Date.now(),
    contextVersion: 1,
  };

  // Compile Memory Passport V1
  const passportV1 = await MemoryEngine.compileMemoryPassport(contextV1, ownerWallet);
  console.log(`- Created Passport V1 with CID: ${passportV1.cid}`);
  
  if (!passportV1.cid.startsWith("QmCM")) {
    throw new Error("Local mock IPFS CID generation failed.");
  }
  
  const savedV1 = await MemoryPassportModel.findOne({ cid: passportV1.cid });
  if (!savedV1 || savedV1.currentVersion !== 1) {
    throw new Error("Passport V1 not successfully indexing in MongoDB.");
  }
  console.log("✔ Swarm V1 compilation passed!\n");

  // 2. Commit Next Version (V2)
  console.log("[Test 2]: Simulating Swarm V2 (Adding UI Designer output)...");
  const contextV2: SharedContext = {
    ...contextV1,
    completedTasks: ["Research", "Developer", "UI Designer"],
    pendingTasks: ["Verifier"],
    uiOutput: {
      uiLayout: { layoutType: "Dashboard Panel", sections: ["Vault Grid", "Tx List"] },
      themeColors: ["#09090b", "#6366f1"],
      componentSpecs: [{ componentName: "VaultCard", styling: "border border-white/5", props: ["vaultName"] }],
    },
    agentHistory: [
      ...contextV1.agentHistory,
      { agentId: "agent_ui", agentName: "UI Designer Agent", role: "UI Designer", action: "Rendered theme colors", timestamp: Date.now() }
    ],
  };

  const passportV2 = await VersionService.createNextVersion(
    passportV1.memoryId,
    contextV2,
    ownerWallet,
    "Integrated custom viewport theme colors and layout details in dashboard"
  );
  console.log(`- Created Passport V2 with CID: ${passportV2.cid}`);

  const history = await VersionService.getVersionHistory(passportV1.memoryId);
  console.log(`- Total committed versions in index: ${history.length + 1}`);

  if (history.length !== 1) {
    throw new Error("VersionHistory should contain 1 historical commit log.");
  }
  console.log(`  Diff Summary: "${history[0]?.diffSummary || ""}"`);
  console.log("✔ Version commit management passed!\n");

  // 3. Rollback & Resume Test
  console.log("[Test 3]: Rebuilding SharedContext from V1 CID (Rollback)...");
  const restoredContextV1 = await MemoryEngine.rebuildSharedContext(passportV1.cid);
  
  console.log(`- Restored Project Name: ${restoredContextV1.projectName}`);
  console.log(`- Restored Research Output: ${restoredContextV1.researchOutput ? "Present" : "Missing"}`);
  console.log(`- Restored Developer Output: ${restoredContextV1.developerOutput ? "Present" : "Missing"}`);
  console.log(`- Restored UI Output: ${restoredContextV1.uiOutput ? "Present" : "Missing"}`);

  if (restoredContextV1.uiOutput) {
    throw new Error("Rollback failed. V1 context should not contain V2 UI outputs.");
  }
  console.log("✔ Rollback and shared context restoration passed!\n");

  console.log("==================================================");
  console.log("ALL MEMORY ENGINE & VERSIONING TESTS PASSED!");
  console.log("==================================================");
  
  // Close database connection
  await mongoose.disconnect();
}

runTests().catch((err) => {
  console.error("❌ Memory engine tests failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
