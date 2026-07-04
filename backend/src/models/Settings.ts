import { Schema, model, Document } from "mongoose";

export interface ISettings extends Document {
  userWalletAddress: string;
  theme: "dark" | "light" | "system";
  groqApiKeyPlaceholder?: string; // Placeholder configuration fields
  monadRpcUrl?: string;
  ipfsGatewayUrl?: string;
  notificationPreferences: {
    email: boolean;
    browser: boolean;
    onChainEvents: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    userWalletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "dark",
    },
    groqApiKeyPlaceholder: {
      type: String,
    },
    monadRpcUrl: {
      type: String,
      default: "https://testnet-rpc.monad.xyz",
    },
    ipfsGatewayUrl: {
      type: String,
      default: "https://gateway.pinata.cloud/ipfs/",
    },
    notificationPreferences: {
      email: { type: Boolean, default: false },
      browser: { type: Boolean, default: true },
      onChainEvents: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export const SettingsModel = model<ISettings>("Settings", SettingsSchema);
