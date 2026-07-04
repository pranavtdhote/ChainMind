import { Request, Response } from "express";
import { TaskRepository } from "../repositories/TaskRepository";

export class TaskController {
  private taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const mockTasks = [
        { id: "task_1", projectId: "proj_1", assignedAgent: "0x1111...", descriptionURI: "QmTasks...", status: "Created" },
      ];
      res.status(200).json({ success: true, data: mockTasks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, descriptionURI } = req.body;
      res.status(201).json({
        success: true,
        data: { id: "task_new", projectId, descriptionURI, status: "Created" },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  assignAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      const { agentAddress } = req.body;
      res.status(200).json({
        success: true,
        message: "Agent assigned to task successfully",
        data: { taskId, assignedAgent: agentAddress, status: "Assigned" },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
