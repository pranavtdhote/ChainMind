import { Schema, model, Document, Types } from "mongoose";

export interface ITask extends Document {
  taskId?: string; // On-chain task id bytes32
  project: Types.ObjectId; // Ref Project
  assignedAgent?: Types.ObjectId; // Ref Agent
  descriptionURI: string; // IPFS CID of task description
  status: "Created" | "Assigned" | "Running" | "PendingVerification" | "Completed" | "Failed";
  resultURI?: string; // IPFS CID of task result output
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    taskId: {
      type: String,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedAgent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
    },
    descriptionURI: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Created", "Assigned", "Running", "PendingVerification", "Completed", "Failed"],
      default: "Created",
    },
    resultURI: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const TaskModel = model<ITask>("Task", TaskSchema);
