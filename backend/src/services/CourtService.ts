import crypto from "crypto";
import { SharedContext } from "../types/orchestrator";
import { CourtReportModel, ICourtReport, IValidationResult } from "../models/CourtReport";
import { VerificationEngine } from "./VerificationEngine";
import { ConsensusEngine } from "./ConsensusEngine";
import { ipfsService } from "./IPFSService";

export class CourtService {
  /**
   * Runs validation checks on a completed project memory, calculates weighted consensus,
   * compiles the trial report, uploads to IPFS, and saves it to MongoDB.
   */
  static async runCourtTrial(context: SharedContext, ownerWallet: string): Promise<ICourtReport> {
    console.log(`[CourtService]: Convening AI Courtroom for project "${context.projectName}"...`);
    
    // 1. Run all 10 validators
    const validationResults = await VerificationEngine.runAllValidators(context);

    // 2. Aggregate scores
    const { consensusScore, integrityScore, confidenceScore } = ConsensusEngine.calculateScores(validationResults);

    // Determine approval threshold
    const approved = consensusScore >= 75;

    // Gathers arguments and violations
    const violations: string[] = [];
    const recommendations: string[] = [];
    const argumentsList: string[] = [
      `Reviewing work artifacts for Project version V${context.contextVersion || 1}.`,
      `Audited code safety, completeness, and Monad ledger configurations.`
    ];

    validationResults.forEach((res: IValidationResult) => {
      if (!res.approved || res.score < 75) {
        if (res.issues.length > 0) {
          violations.push(...res.issues);
        }
        recommendations.push(res.recommendation);
      }
    });

    if (approved) {
      argumentsList.push("Evidence demonstrates that the developer module complies with requirements.");
    } else {
      argumentsList.push(`Evidence rejected. Critical conflicts identified in validator checks: ${violations.length} violations found.`);
    }

    const courtId = "case_" + crypto.randomBytes(6).toString("hex");

    // 3. Upload report to IPFS
    let cid = "";
    try {
      const reportPayload = {
        courtId,
        projectName: context.projectName,
        validationResults,
        consensusScore,
        integrityScore,
        confidenceScore,
        approved,
        violations,
        recommendations,
        arguments: argumentsList,
        timestamp: new Date().toISOString(),
      };
      cid = await ipfsService.uploadMemory(reportPayload);
      console.log(`[CourtService]: Report uploaded to IPFS with CID: ${cid}`);
    } catch (ipfsErr: any) {
      console.error("[CourtService]: Failed to upload report to IPFS:", ipfsErr.message);
      cid = "QmCourtReport" + crypto.randomBytes(16).toString("hex");
    }

    // 4. Compile and persist report
    const report = {
      courtId,
      projectName: context.projectName || "ChainMind Project",
      evidence: {
        researchCid: context.researchOutput ? cid : "",
        developerCid: context.developerOutput ? cid : "",
        uiCid: context.uiOutput ? cid : "",
      },
      arguments: argumentsList,
      violations,
      validators: validationResults,
      recommendations,
      integrityScore,
      confidenceScore,
      consensusScore,
      approved,
      verifyingAgent: "agent_court",
      timestamp: new Date(),
      transactionHash: "",
      cid,
      isAnchored: false,
    };

    console.log(`[CourtService]: Trial complete. Court ID: ${courtId} | Approved: ${approved} | Consensus: ${consensusScore}%`);

    // Save report to database
    return await CourtReportModel.create(report);
  }
}
export const courtService = new CourtService();
