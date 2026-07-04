import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  username?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      // Future: add regex validation for Ethereum/Monad public keys (0x...)
    },
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUser>("User", UserSchema);
