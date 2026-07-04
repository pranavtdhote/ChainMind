import { Schema, model, Document } from "mongoose";

export interface IAgent extends Document {
  walletAddress: string; // Unique public address for the agent
  name: string;
  role: string; // e.g. Writer, Coder, Reviewer, Auditor
  metadataURI: string; // IPFS CID pointing to details (capabilities, prompt rules)
  reputationScore: number; // 0 to 100 on-chain rating
  isActive: boolean;
  registeredOnChain: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    metadataURI: {
      type: String,
      required: true,
    },
    reputationScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registeredOnChain: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const AgentModel = model<IAgent>("Agent", AgentSchema);
