import { BaseRepository } from "./BaseRepository";
import { IProject, ProjectModel } from "../models/Project";

export class ProjectRepository extends BaseRepository<IProject> {
  constructor() {
    super(ProjectModel);
  }

  async findByOwner(ownerAddress: string): Promise<IProject[]> {
    return this.model.find({ ownerAddress: ownerAddress.toLowerCase() }).populate("agents").exec();
  }
}
