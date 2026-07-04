import { Request, Response } from "express";
import { MemoryRepository } from "../repositories/MemoryRepository";

export class MemoryController {
  private memoryRepository: MemoryRepository;

  constructor(memoryRepository: MemoryRepository) {
    this.memoryRepository = memoryRepository;
  }

  getMemories = async (req: Request, res: Response): Promise<void> => {
    try {
      const mockMemories = [
        { id: "m1", memoryId: "0x1234", ipfsHash: "QmYwAP...", isPrivate: false },
      ];
      res.status(200).json({ success: true, data: mockMemories });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  registerMemory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, taskId, creatorAgentAddress, ipfsHash, isPrivate } = req.body;
      res.status(201).json({
        success: true,
        data: { id: "mem_new", projectId, taskId, creatorAgentAddress, ipfsHash, isPrivate },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
