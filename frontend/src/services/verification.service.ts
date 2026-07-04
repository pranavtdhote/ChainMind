export interface IVerificationCase {
  id?: string;
  caseId?: string;
  taskId: string;
  reportURI: string;
  status: "Pending" | "Approved" | "Rejected";
  consensusScore: number;
  approvalsCount: number;
  rejectionsCount: number;
  expirationTime: number;
}

export interface IVerificationService {
  /**
   * Submit a task result for AgentCourt verification.
   * @param taskId ID of the task to verify.
   * @param resultURI IPFS URI of the result.
   */
  submitForVerification(taskId: string, resultURI: string): Promise<IVerificationCase>;

  /**
   * Cast an auditor vote (approve or reject) on a pending case.
   */
  voteOnCase(caseId: string, approve: boolean): Promise<boolean>;

  /**
   * Request finalized consensus resolving for a voting case.
   */
  finalizeVerification(caseId: string): Promise<IVerificationCase>;

  /**
   * Get active cases pending audit.
   */
  getPendingCases(): Promise<IVerificationCase[]>;

  /**
   * Get verification case details by task ID.
   */
  getCaseByTaskId(taskId: string): Promise<IVerificationCase | null>;
}
