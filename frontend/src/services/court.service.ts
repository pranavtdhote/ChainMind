import { API_URL as BASE_API_URL } from "@/lib/api";

const API_URL = `${BASE_API_URL}/api`;

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
    const res = await fetch(`${API_URL}/court/statistics`);
    if (!res.ok) throw new Error(`Court statistics request failed: ${res.status}`);
    const json = await res.json();
    if (json.success) return json.data;
    throw new Error(json.error || "Failed to fetch court stats.");
  }

  static async getHistory(): Promise<ICourtCaseSummary[]> {
    const res = await fetch(`${API_URL}/court/history`);
    if (!res.ok) throw new Error(`Court history request failed: ${res.status}`);
    const json = await res.json();
    if (json.success) return json.data;
    throw new Error(json.error || "Failed to fetch court history.");
  }

  static async getReport(courtId: string): Promise<any> {
    const res = await fetch(`${API_URL}/court/report/${courtId}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success) return json.data;
    return null;
  }

  static async anchorReport(courtId: string, transactionHash: string, onChainCaseId?: string): Promise<any> {
    const res = await fetch(`${API_URL}/court/report/${courtId}/anchor`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionHash, onChainCaseId }),
    });
    if (!res.ok) throw new Error(`Anchor request failed: ${res.status}`);
    const json = await res.json();
    if (json.success) return json.data;
    throw new Error(json.error || "Failed to update transaction anchor.");
  }
}
