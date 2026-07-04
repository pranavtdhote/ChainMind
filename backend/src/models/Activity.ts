import { Schema, model, Document, Types } from "mongoose";

export interface IActivity extends Document {
  type: "AgentRegister" | "TaskCreate" | "TaskComplete" | "VerificationInitiate" | "VoteSubmit" | "MemoryRegister" | "SystemLog";
  description: string;
  agent?: Types.ObjectId; // Associated Agent (ref Agent)
  project?: Types.ObjectId; // Associated Project (ref Project)
  txHash?: string; // Blockchain transaction hash on Monad
  metadata?: Record<string, any>; // Generic JSON details
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      required: true,
      enum: ["AgentRegister", "TaskCreate", "TaskComplete", "VerificationInitiate", "VoteSubmit", "MemoryRegister", "SystemLog"],
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    txHash: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityModel = model<IActivity>("Activity", ActivitySchema);
