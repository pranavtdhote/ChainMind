import { Request, Response } from "express";
import { ProjectRepository } from "../repositories/ProjectRepository";

export class ProjectController {
  private projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      // In future: const projects = await this.projectRepository.find();
      const mockProjects = [
        { id: "proj_1", name: "Smart Contract Audit", description: "Audit ERC20 tokens", isActive: true },
      ];
      res.status(200).json({ success: true, data: mockProjects });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, ownerAddress } = req.body;
      res.status(201).json({
        success: true,
        data: { id: "proj_new", name, description, ownerAddress, isActive: true },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
