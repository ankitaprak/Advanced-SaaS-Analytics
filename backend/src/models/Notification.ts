import mongoose, { Document, Schema, Types } from "mongoose";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({
  userId: 1,
  createdAt: -1,
});

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);

export default Notification;