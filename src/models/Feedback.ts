import mongoose from "mongoose";

export type FeedbackType = "issue" | "feature";

export interface IFeedback extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  email?: string;
  type: FeedbackType;
  message: string;
  status: "new" | "reviewed";
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new mongoose.Schema<IFeedback>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["issue", "feature"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["new", "reviewed"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

export const Feedback =
  mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
