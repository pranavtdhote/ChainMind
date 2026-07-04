import { Schema, model, Document } from "mongoose";

export interface IConversation extends Document {
  conversationId: string;
  prompt: string;
  projectName: string;
  logs: Array<{
    step: string;
    agentRole?: string;
    status: string;
    message: string;
    timestamp: number;
  }>;
  context: any;
  cid?: string;
  courtReportId?: string;
  ownerWallet: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      default: "ChainMind Project",
    },
    logs: [
      {
        step: String,
        agentRole: String,
        status: String,
        message: String,
        timestamp: Number,
      },
    ],
    context: {
      type: Schema.Types.Mixed,
    },
    cid: {
      type: String,
      default: "",
    },
    courtReportId: {
      type: String,
      default: "",
    },
    ownerWallet: {
      type: String,
      default: "",
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ConversationModel = model<IConversation>("Conversation", ConversationSchema);
