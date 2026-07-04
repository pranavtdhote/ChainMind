import { Schema, model, Document, Types } from "mongoose";

export interface IMemory extends Document {
  memoryId?: string; // On-chain memory id hash
  project: Types.ObjectId; // Ref Project
  task?: Types.ObjectId; // Ref Task (optional if independent memory)
  creatorAgent: Types.ObjectId; // Ref Agent
  ipfsHash: string; // CID of memory content (inputs, outputs, feedback)
  isPrivate: boolean;
  onChainRegistered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<IMemory>(
  {
    memoryId: {
      type: String,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    creatorAgent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    ipfsHash: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    onChainRegistered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const MemoryModel = model<IMemory>("Memory", MemorySchema);
