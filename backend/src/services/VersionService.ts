import { MemoryPassportModel, IMemoryPassport } from "../models/MemoryPassport";
import { VersionModel, IVersion } from "../models/Version";
import { MemoryEngine } from "./MemoryEngine";
import { SharedContext } from "../types/orchestrator";

export class VersionService {
  /**
   * Commits updates to an existing project knowledge base, saving a new version
   * reference and appending it to the history.
   */
  static async createNextVersion(
    memoryId: string,
    updatedContext: SharedContext,
    ownerWallet: string,
    diffSummary: string
  ): Promise<IMemoryPassport> {
    console.log(`[VersionService]: Creating next version for memoryId: ${memoryId}...`);
    
    // Find latest version from DB
    const parentPassport = await MemoryPassportModel.findOne({ memoryId }).sort({ currentVersion: -1 });
    if (!parentPassport) {
      throw new Error(`Memory Passport with ID ${memoryId} not found.`);
    }

    const parentCid = parentPassport.cid;
    const nextVersionNumber = parentPassport.currentVersion + 1;
    updatedContext.contextVersion = nextVersionNumber;

    // Compile new IPFS payload
    const nextPassport = await MemoryEngine.compileMemoryPassport(
      updatedContext,
      ownerWallet,
      parentCid
    );

    // Save historical commit log
    await VersionModel.create({
      memoryId,
      versionNumber: nextVersionNumber,
      parentCid,
      currentCid: nextPassport.cid,
      diffSummary,
      timestamp: new Date(),
    });

    console.log(`[VersionService]: Committed Version ${nextVersionNumber} with CID: ${nextPassport.cid}`);
    return nextPassport;
  }

  /**
   * Rolls back a project memory to a specific version number and returns its reconstructed context.
   */
  static async rollbackToVersion(memoryId: string, versionNumber: number): Promise<SharedContext> {
    console.log(`[VersionService]: Rolling back memory ${memoryId} to version ${versionNumber}...`);
    
    const versionEntry = await VersionModel.findOne({ memoryId, versionNumber });
    if (!versionEntry) {
      throw new Error(`Version commit ${versionNumber} not found for memory ID ${memoryId}`);
    }

    // Reconstruct context
    return await MemoryEngine.rebuildSharedContext(versionEntry.currentCid);
  }

  /**
   * Returns list of all version commits for a memory passport.
   */
  static async getVersionHistory(memoryId: string): Promise<IVersion[]> {
    return await VersionModel.find({ memoryId }).sort({ versionNumber: -1 });
  }
}
export const versionService = new VersionService();
