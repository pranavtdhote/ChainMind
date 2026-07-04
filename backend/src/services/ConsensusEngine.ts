import { IValidationResult } from "../models/CourtReport";

export class ConsensusEngine {
  /**
   * Calculates Consensus, Integrity and Confidence ratings based on modular validations.
   */
  static calculateScores(results: IValidationResult[]): {
    consensusScore: number;
    integrityScore: number;
    confidenceScore: number;
  } {
    let consensusSum = 0;
    
    // Weighted consensus formula (8 modules = 100 points total)
    const weights: Record<string, number> = {
      "Requirement Validator": 25,
      "Architecture Validator": 20,
      "Security Validator": 15,
      "Completeness Validator": 15,
      "Monad Usage Validator": 10,
      "IPFS Validator": 5,
      "Documentation Validator": 5,
      "Best Practice Validator": 5,
    };

    // Calculate Consensus Score (Weighted)
    let weightedPoints = 0;
    let totalWeight = 0;
    results.forEach((res) => {
      const weight = weights[res.validatorName];
      if (weight !== undefined) {
        weightedPoints += (res.score * weight) / 100;
        totalWeight += weight;
      }
    });
    const consensusScore = Math.round(totalWeight > 0 ? (weightedPoints / totalWeight) * 100 : 0);

    // Calculate Integrity Score (Simple average of all 10 validators)
    const totalScoreSum = results.reduce((acc, res) => acc + res.score, 0);
    const integrityScore = Math.round(results.length > 0 ? totalScoreSum / results.length : 0);

    // Calculate Confidence Score based on Technology + Consistency (The remaining two validators)
    const confidenceValidators = ["Technology Validator", "Consistency Validator"];
    const confidenceResults = results.filter((res) => confidenceValidators.includes(res.validatorName));
    const confidenceScore = Math.round(
      confidenceResults.length > 0
        ? confidenceResults.reduce((acc, res) => acc + res.score, 0) / confidenceResults.length
        : 100
    );

    return {
      consensusScore,
      integrityScore,
      confidenceScore,
    };
  }
}
