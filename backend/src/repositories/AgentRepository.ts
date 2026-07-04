import { BaseRepository } from "./BaseRepository";
import { IAgent, AgentModel } from "../models/Agent";

export class AgentRepository extends BaseRepository<IAgent> {
  constructor() {
    super(AgentModel);
  }

  async findByWallet(walletAddress: string): Promise<IAgent | null> {
    return this.model.findOne({ walletAddress: walletAddress.toLowerCase() }).exec();
  }

  async getActiveAgents(): Promise<IAgent[]> {
    return this.model.find({ isActive: true }).exec();
  }
}
