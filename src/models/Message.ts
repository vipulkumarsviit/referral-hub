import mongoose from "mongoose";

export interface IMessage extends mongoose.Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    applicationId?: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: false, // Optional, but useful for associating messages directly to an application
        },
        content: {
            type: String,
            required: [true, "Message content is required"],
        },
    },
    {
        timestamps: true,
    }
);

export const Message =
    mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
