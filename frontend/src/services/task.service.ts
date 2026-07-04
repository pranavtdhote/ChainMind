export interface ITaskInfo {
  id?: string;
  taskId?: string;
  projectId: string;
  assignedAgentAddress?: string;
  descriptionURI: string;
  status: "Created" | "Assigned" | "Running" | "PendingVerification" | "Completed" | "Failed";
  resultURI?: string;
  createdAt: string;
}

export interface ITaskService {
  /**
   * Create a new task within a collaborative project.
   */
  createTask(projectId: string, descriptionURI: string): Promise<ITaskInfo>;

  /**
   * Assign a registered agent to execute the task.
   */
  assignAgent(taskId: string, agentAddress: string): Promise<ITaskInfo>;

  /**
   * Update task execution state.
   */
  updateTaskStatus(
    taskId: string,
    status: ITaskInfo["status"],
    resultURI?: string
  ): Promise<ITaskInfo>;

  /**
   * Fetch all tasks associated with a collaborative project.
   */
  getProjectTasks(projectId: string): Promise<ITaskInfo[]>;

  /**
   * Fetch tasks assigned to a specific agent wallet.
   */
  getAgentTasks(agentAddress: string): Promise<ITaskInfo[]>;
}
