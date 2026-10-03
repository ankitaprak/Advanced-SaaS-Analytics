import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITransaction extends Document {
  transactionId: string;
  userId: Types.ObjectId;
  customer: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  paymentMethod: "card" | "upi" | "bank_transfer" | "other";
  date: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customer: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "bank_transfer", "other"],
      default: "other",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema,
);
