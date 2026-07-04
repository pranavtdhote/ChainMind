import { BaseRepository } from "./BaseRepository";
import { IMemory, MemoryModel } from "../models/Memory";

export class MemoryRepository extends BaseRepository<IMemory> {
  constructor() {
    super(MemoryModel);
  }

  async findByProject(projectId: string): Promise<IMemory[]> {
    return this.model.find({ project: projectId }).populate("creatorAgent").exec();
  }

  async findPublicMemories(): Promise<IMemory[]> {
    return this.model.find({ isPrivate: false }).populate("creatorAgent").exec();
  }
}
