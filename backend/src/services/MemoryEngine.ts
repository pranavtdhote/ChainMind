import crypto from "crypto";
import { SharedContext } from "../types/orchestrator";
import { MemoryPassportModel, IMemoryPassport } from "../models/MemoryPassport";
import { ipfsService } from "./IPFSService";

export class MemoryEngine {
  /**
   * Compiles the SharedContext and outputs into a unified Memory Passport,
   * uploads the passport JSON to IPFS, and saves metadata to Mongoose database.
   */
  static async compileMemoryPassport(
    context: SharedContext,
    ownerWallet: string,
    parentCid?: string
  ): Promise<IMemoryPassport> {
    const memoryId = "mem_" + crypto.randomBytes(8).toString("hex");

    // Standardize technologies array from research and developer artifacts
    const technologiesSet = new Set<string>();
    if (context.researchOutput?.libraries) {
      context.researchOutput.libraries.forEach((lib: string) => technologiesSet.add(lib));
    }
    if (context.developerOutput?.generatedModules) {
      technologiesSet.add("TypeScript");
    }

    // Extract contributors list from execution logs
    const contributors = Array.from(new Set(context.agentHistory.map((h) => h.agentName)));

    // Create the memory passport payload
    const passportPayload = {
      memoryId,
      projectName: context.projectName || "ChainMind Project",
      description: context.userGoal || "",
      ownerWallet: ownerWallet.toLowerCase(),
      creatorAgent: "agent_manager",
      contributors,
      
      // JSON artifacts
      researchArtifact: context.researchOutput || undefined,
      developerArtifact: context.developerOutput || undefined,
      uiArtifact: context.uiOutput || undefined,
      documentationArtifact: context.documentation || undefined,
      verificationArtifact: context.verificationOutput || undefined,

      projectSummary: context.developerOutput?.implementationSummary || "Artifact compilation completed.",
      technologies: Array.from(technologiesSet),
      currentVersion: context.contextVersion || 1,
      parentVersion: parentCid || undefined,
      childVersions: [],
      
      cid: "", // To be assigned post-upload
      permissionLevel: "Public" as const,
      integrityScore: context.verificationOutput?.integrityScore ?? 100,
      trustScore: context.verificationOutput?.confidence ?? 100,
    };

    console.log(`[MemoryEngine]: Uploading canonical project-memory.json for "${passportPayload.projectName}" to IPFS...`);
    const cid = await ipfsService.uploadMemory(passportPayload);
    passportPayload.cid = cid;

    // Save index record to Database
    const passportDoc = await MemoryPassportModel.create(passportPayload as any);
    
    // Update parent's child list if parent CID was supplied
    if (parentCid) {
      await MemoryPassportModel.updateOne(
        { cid: parentCid },
        { $addToSet: { childVersions: cid } }
      );
    }

    console.log(`[MemoryEngine]: Created Memory Passport with ID: ${memoryId} | CID: ${cid}`);
    return passportDoc;
  }

  /**
   * Downloads a Memory Passport from IPFS using its CID and reconstructs the SharedContext
   * to resume project execution from where it left off.
   */
  static async rebuildSharedContext(cid: string): Promise<SharedContext> {
    console.log(`[MemoryEngine]: Fetching memory passport from IPFS for CID: ${cid}`);
    const passport = await ipfsService.downloadMemory(cid);

    if (!passport || !passport.memoryId) {
      throw new Error("Downloaded IPFS payload is not a valid Memory Passport.");
    }

    // Reconstruct the history entries list
    const agentHistory = passport.contributors.map((contrib: string, idx: number) => ({
      agentId: `agent_${contrib.toLowerCase().replace(/\s+/g, "_")}`,
      agentName: contrib,
      role: contrib.split(" ")[0] || "Worker",
      action: `Restored session contributor context for ${contrib}`,
      timestamp: Date.now() - (idx * 60 * 1000),
    }));

    const context: SharedContext = {
      projectName: passport.projectName,
      userGoal: passport.description,
      requirements: passport.researchArtifact?.recommendations || [],
      currentTask: "Session Restored. Ready for instructions.",
      completedTasks: [
        passport.researchArtifact ? "Requirements Research" : "",
        passport.developerArtifact ? "Modules Development" : "",
        passport.uiArtifact ? "Interface Design" : "",
        passport.documentationArtifact ? "API Documentation" : "",
        passport.verificationArtifact ? "Output Auditing" : "",
      ].filter(Boolean),
      pendingTasks: [],
      
      researchOutput: passport.researchArtifact || undefined,
      developerOutput: passport.developerArtifact || undefined,
      uiOutput: passport.uiArtifact || undefined,
      documentation: passport.documentationArtifact || undefined,
      verificationOutput: passport.verificationArtifact || undefined,

      agentHistory,
      currentStatus: "Idle",
      timestamp: Date.now(),
      contextVersion: passport.currentVersion || 1,
    };

    console.log(`[MemoryEngine]: Rebuilt SharedContext successfully from CID: ${cid}`);
    return context;
  }
}
export const memoryEngine = new MemoryEngine();
