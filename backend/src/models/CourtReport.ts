import { Schema, model, Document } from "mongoose";

export interface IValidationResult {
  validatorName: string;
  score: number; // 0 to 100
  approved: boolean;
  issues: string[];
  recommendation: string;
}

export interface ICourtReport extends Document {
  courtId: string;
  projectName: string;
  evidence: {
    researchCid?: string;
    developerCid?: string;
    uiCid?: string;
  };
  arguments: string[];
  violations: string[];
  validators: IValidationResult[];
  recommendations: string[];
  integrityScore: number;
  confidenceScore: number;
  consensusScore: number;
  approved: boolean;
  timestamp: Date;
  verifyingAgent: string;
  transactionHash?: string;
  cid?: string;
  isAnchored?: boolean;
}

const ValidationResultSchema = new Schema<IValidationResult>({
  validatorName: { type: String, required: true },
  score: { type: Number, required: true },
  approved: { type: Boolean, required: true },
  issues: [{ type: String }],
  recommendation: { type: String, required: true },
});

const CourtReportSchema = new Schema<ICourtReport>(
  {
    courtId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    projectName: {
      type: String,
      required: true,
      index: true,
    },
    evidence: {
      researchCid: { type: String, default: "" },
      developerCid: { type: String, default: "" },
      uiCid: { type: String, default: "" },
    },
    arguments: [{ type: String }],
    violations: [{ type: String }],
    validators: [ValidationResultSchema],
    recommendations: [{ type: String }],
    integrityScore: {
      type: Number,
      required: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
    },
    consensusScore: {
      type: Number,
      required: true,
    },
    approved: {
      type: Boolean,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    verifyingAgent: {
      type: String,
      required: true,
    },
    transactionHash: {
      type: String,
      default: "",
    },
    cid: {
      type: String,
      default: "",
      index: true,
    },
    isAnchored: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CourtReportModel = model<ICourtReport>("CourtReport", CourtReportSchema);
