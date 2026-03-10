import mongoose from "mongoose";

export type UserRole = "seeker" | "referrer";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    image?: string;
    company?: string;
    jobTitle?: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Please provide your name"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            select: false,
        },
        role: {
            type: String,
            enum: ["seeker", "referrer"],
            required: true,
            default: "seeker",
        },
        image: {
            type: String,
        },
        company: {
            type: String,
        },
        jobTitle: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent Next.js hot reload from compiling model multiple times
export const User =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
