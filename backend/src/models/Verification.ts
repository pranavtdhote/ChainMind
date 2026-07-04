import { Schema, model, Document, Types } from "mongoose";

export interface IVerification extends Document {
  caseId?: string; // On-chain case id bytes32
  task: Types.ObjectId; // Ref Task
  reportURI: string; // IPFS CID of verification details
  status: "Pending" | "Approved" | "Rejected";
  consensusScore: number; // 0 to 100 percentage
  approvalsCount: number;
  rejectionsCount: number;
  votes: {
    agent: Types.ObjectId; // Ref Agent
    approved: boolean;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    caseId: {
      type: String,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    reportURI: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    consensusScore: {
      type: Number,
      default: 0,
    },
    approvalsCount: {
      type: Number,
      default: 0,
    },
    rejectionsCount: {
      type: Number,
      default: 0,
    },
    votes: [
      {
        agent: {
          type: Schema.Types.ObjectId,
          ref: "Agent",
          required: true,
        },
        approved: {
          type: Boolean,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const VerificationModel = model<IVerification>("Verification", VerificationSchema);
