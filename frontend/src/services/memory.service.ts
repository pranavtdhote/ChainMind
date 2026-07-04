export interface IMemoryPayload {
  role: string;
  agentName: string;
  prompt: string;
  response: string;
  contextHashes: string[];
  timestamp: number;
}

export interface IMemoryRecord {
  id?: string;
  memoryId?: string;
  projectId: string;
  taskId?: string;
  creatorAgentAddress: string;
  ipfsHash: string;
  isPrivate: boolean;
  content?: IMemoryPayload;
  createdAt: string;
}

export interface IMemoryService {
  /**
   * Save a collaborative memory segment (uploads JSON metadata payload to IPFS, registers CID on Monad).
   * @param projectId Project ID.
   * @param taskId Task ID.
   * @param payload Memory contents.
   */
  createMemory(
    projectId: string,
    taskId: string,
    payload: IMemoryPayload,
    isPrivate: boolean
  ): Promise<IMemoryRecord>;

  /**
   * Fetch memory logs for a specific project.
   */
  getProjectMemories(projectId: string): Promise<IMemoryRecord[]>;

  /**
   * Search public memory records.
   */
  searchMemories(query: string, filters?: Record<string, any>): Promise<IMemoryRecord[]>;

  /**
   * Retrieve memory details by ID, including resolving and caching IPFS CID contents.
   */
  getMemoryDetails(id: string): Promise<IMemoryRecord | null>;
}
