import { Schema, model, Document } from "mongoose";

export interface IVersion extends Document {
  memoryId: string; // The memory passport identifier
  versionNumber: number;
  parentCid?: string;
  currentCid: string;
  diffSummary: string;
  timestamp: Date;
}

const VersionSchema = new Schema<IVersion>(
  {
    memoryId: {
      type: String,
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    parentCid: {
      type: String,
      default: null,
    },
    currentCid: {
      type: String,
      required: true,
      index: true,
    },
    diffSummary: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index to speed up lookups for a specific memory's version number
VersionSchema.index({ memoryId: 1, versionNumber: 1 }, { unique: true });

export const VersionModel = model<IVersion>("Version", VersionSchema);
