import dotenv from "dotenv";
import mongoose from "mongoose";
import { TaskPlanner } from "./TaskPlanner";
import { AgentRegistry } from "./AgentRegistry";
import { AgentOrchestratorService } from "./AgentOrchestratorService";
import { connectDB } from "../../config/db";
import { CourtReportModel } from "../../models/CourtReport";

// Load configurations
dotenv.config();

async function runTests() {
  console.log("==========================================");
  console.log("RUNNING CHAINMIND ORCHESTRATION TEST SUITE");
  console.log("==========================================\n");

  // Connect to DB
  await connectDB();
  await CourtReportModel.deleteMany({ projectName: "NFT Marketplace Swarm" });

  // 1. Test Agent Registry
  console.log("[Test 1]: Validating Agent Swarm Registry...");
  const registry = AgentRegistry.getInstance();
  const agents = registry.getAllAgents();
  console.log(`Registered agents count: ${agents.length}`);
  if (agents.length !== 6) {
    throw new Error("Registry is missing some required agents.");
  }
  for (const entry of agents) {
    console.log(`- Role: ${entry.agent.role} | Avg Time: ${entry.averageCompletionTime} | Status: ${entry.status}`);
  }
  console.log("✔ Agent Swarm Registry test passed!\n");

  // 2. Test Task Planner Graph Generation
  console.log("[Test 2]: Validating Task Planner Intent Slices...");
  const planner = new TaskPlanner();
  const graph = await planner.planTask("Build an ERC-20 token and generate setup docs");
  console.log("Generated Task Graph:");
  console.log(`- Project Name: ${graph.projectName}`);
  console.log(`- Goal: ${graph.goal}`);
  console.log(`- Steps planned: ${graph.tasks.length}`);
  
  if (!graph.projectName || graph.tasks.length === 0) {
    throw new Error("Task graph planning returned empty graph.");
  }
  console.log("✔ Task Planner test passed!\n");

  // 3. Test Agent Execution & Fallback Models
  console.log("[Test 3]: Validating Full Orchestrator Loop...");
  const orchestrator = new AgentOrchestratorService();
  
  const finalContext = await orchestrator.orchestrate(
    "Build an NFT marketplace and verify contract code",
    (log) => {
      console.log(`  [Step Log]: ${log.step} (${log.status}) -> ${log.message}`);
    }
  );

  console.log("\nCompiled Knowledge Base Artifacts:");
  console.log(`- Research Output: ${finalContext.researchOutput ? "Present" : "Missing"}`);
  console.log(`- Developer Output: ${finalContext.developerOutput ? "Present" : "Missing"}`);
  console.log(`- UI Output: ${finalContext.uiOutput ? "Present" : "Missing"}`);
  console.log(`- Verification: ${finalContext.verificationOutput ? "Present" : "Missing"}`);
  console.log(`- History Entries: ${finalContext.agentHistory.length}`);
  
  if (finalContext.agentHistory.length === 0) {
    throw new Error("Orchestration failed to record execution history logs.");
  }

  console.log("\n==========================================");
  console.log("ALL CHAINMIND ORCHESTRATION TESTS PASSED!");
  console.log("==========================================");

  await mongoose.disconnect();
}

runTests().catch(async (err) => {
  console.error("❌ Orchestration tests failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
