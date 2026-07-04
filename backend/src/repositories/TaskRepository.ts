import { BaseRepository } from "./BaseRepository";
import { ITask, TaskModel } from "../models/Task";

export class TaskRepository extends BaseRepository<ITask> {
  constructor() {
    super(TaskModel);
  }

  async findByProject(projectId: string): Promise<ITask[]> {
    return this.model.find({ project: projectId }).populate("assignedAgent").exec();
  }

  async findByAgent(agentId: string): Promise<ITask[]> {
    return this.model.find({ assignedAgent: agentId }).exec();
  }
}
