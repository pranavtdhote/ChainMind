import { API_BASE_URL } from "@/config/api";

const API_URL = `${API_BASE_URL}/api`;

export interface ICourtStatistics {
  totalCases: number;
  averageIntegrity: number;
  averageConsensus: number;
  averageConfidence: number;
  failedVerifications: number;
  approvedCount: number;
  approvalRate: number;
  courtStatus: string;
  verifierStatus: string;
}

export interface ICourtCaseSummary {
  courtId: string;
  projectName: string;
  integrityScore: number;
  consensusScore: number;
  approved: boolean;
  timestamp: string;
  confidenceScore?: number;
}

export class CourtService {
  static async getStatistics(): Promise<ICourtStatistics> {
    try {
      const res = await fetch(`${API_URL}/court/statistics`);
      const json = await res.json();
      if (json.success) return json.data;
      throw new Error(json.error || "Failed to fetch court stats.");
    } catch (error) {
      console.warn("[CourtService]: Using fallback statistics.", error);
      return {
        totalCases: 3,
        averageIntegrity: 82,
        averageConsensus: 78,
        averageConfidence: 85,
        failedVerifications: 1,
        approvedCount: 2,
        approvalRate: 67,
        courtStatus: "Active",
        verifierStatus: "Online",
      };
    }
  }

  static async getHistory(): Promise<ICourtCaseSummary[]> {
    try {
      const res = await fetch(`${API_URL}/court/history`);
      const json = await res.json();
      if (json.success) return json.data;
      throw new Error(json.error || "Failed to fetch court history.");
    } catch (error) {
      console.warn("[CourtService]: Using fallback history.", error);
      return [
        {
          courtId: "case_022e0f900dff",
          projectName: "NFT Marketplace Swarm",
          integrityScore: 82,
          consensusScore: 78,
          approved: true,
          timestamp: new Date().toISOString(),
        },
        {
          courtId: "case_214cf5da76cd",
          projectName: "DeFi Aggregator Swarm",
          integrityScore: 65,
          consensusScore: 60,
          approved: false,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        }
      ];
    }
  }

  static async getReport(courtId: string): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/court/report/${courtId}`);
      const json = await res.json();
      if (json.success) return json.data;
      throw new Error(json.error || "Failed to fetch report.");
    } catch (error) {
      console.warn("[CourtService]: Using mock report details.", error);
      return null;
    }
  }

  static async anchorReport(courtId: string, transactionHash: string, onChainCaseId?: string): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/court/report/${courtId}/anchor`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionHash, onChainCaseId }),
      });
      const json = await res.json();
      if (json.success) return json.data;
      throw new Error(json.error || "Failed to update transaction anchor.");
    } catch (error) {
      console.error("[CourtService]: Failed to anchor report in DB:", error);
      throw error;
    }
  }
}
