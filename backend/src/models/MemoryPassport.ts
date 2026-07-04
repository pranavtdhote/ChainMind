import { Schema, model, Document } from "mongoose";

export interface IMemoryPassport extends Document {
  memoryId: string;
  projectName: string;
  description: string;
  ownerWallet: string;
  creatorAgent: string;
  contributors: string[];
  
  // Artifacts JSON copies
  researchArtifact?: any;
  developerArtifact?: any;
  uiArtifact?: any;
  documentationArtifact?: any;
  verificationArtifact?: any;
  learningInsights?: {
    optimizations: string[];
    commonErrorsResolved: number;
    bestPractices: string[];
    timestamp: Date;
  };

  projectSummary: string;
  technologies: string[];
  currentVersion: number;
  parentVersion?: string; // CID of parent
  childVersions: string[]; // CIDs of children
  
  cid: string; // IPFS CID
  transactionHash?: string;
  permissionLevel: "Public" | "Private";
  integrityScore: number;
  trustScore: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const MemoryPassportSchema = new Schema<IMemoryPassport>(
  {
    memoryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    ownerWallet: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    creatorAgent: {
      type: String,
      required: true,
    },
    contributors: [
      {
        type: String,
      },
    ],
    researchArtifact: {
      type: Schema.Types.Mixed,
    },
    developerArtifact: {
      type: Schema.Types.Mixed,
    },
    uiArtifact: {
      type: Schema.Types.Mixed,
    },
    documentationArtifact: {
      type: Schema.Types.Mixed,
    },
    verificationArtifact: {
      type: Schema.Types.Mixed,
    },
    learningInsights: {
      type: Schema.Types.Mixed,
    },
    projectSummary: {
      type: String,
      default: "",
    },
    technologies: [
      {
        type: String,
        index: true,
      },
    ],
    currentVersion: {
      type: Number,
      default: 1,
    },
    parentVersion: {
      type: String,
      default: null,
    },
    childVersions: [
      {
        type: String,
      },
    ],
    cid: {
      type: String,
      required: true,
      index: true,
    },
    transactionHash: {
      type: String,
      default: "",
    },
    permissionLevel: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },
    integrityScore: {
      type: Number,
      default: 100,
    },
    trustScore: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

export const MemoryPassportModel = model<IMemoryPassport>("MemoryPassport", MemoryPassportSchema);
