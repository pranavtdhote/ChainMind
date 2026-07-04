import { Schema, model, Document, Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  ownerAddress: string; // Wallet address of project owner
  agents: Types.ObjectId[]; // Participating agents (ref Agent)
  tasks: Types.ObjectId[]; // Tasks belonging to this project (ref Task)
  isActive: boolean;
  onChainProjectId?: string; // Hex representation of bytes32 projectId from CollaborationRegistry.sol
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ownerAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    agents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Agent",
      },
    ],
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    onChainProjectId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ProjectModel = model<IProject>("Project", ProjectSchema);
