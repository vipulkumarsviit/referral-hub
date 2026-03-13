import mongoose from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    image?: string;
    workEmail?: string;
    workEmailVerified: boolean;
    workEmailVerifyToken?: string;
    workEmailVerifyExpires?: Date;
    emailVerifyToken?: string;
    emailVerifyExpires?: Date;
    company?: string;
    jobTitle?: string;
    bio?: string;
    linkedIn?: string;
    resumeUrl?: string;
    skills?: string[];
    preferredRole?: string;
    preferredLocation?: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
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
            enum: ["user", "admin"],
            required: true,
            default: "user",
        },
        image: {
            type: String,
        },
        workEmail: {
            type: String,
            lowercase: true,
            trim: true,
        },
        workEmailVerified: {
            type: Boolean,
            default: false,
        },
        workEmailVerifyToken: {
            type: String,
            select: false,
        },
        workEmailVerifyExpires: {
            type: Date,
            select: false,
        },
        emailVerifyToken: {
            type: String,
            select: false,
        },
        emailVerifyExpires: {
            type: Date,
            select: false,
        },
        company: {
            type: String,
        },
        jobTitle: {
            type: String,
        },
        bio: {
            type: String,
            maxlength: 150,
        },
        linkedIn: {
            type: String,
        },
        resumeUrl: {
            type: String,
        },
        skills: {
            type: [String],
            default: [],
        },
        preferredRole: {
            type: String,
        },
        preferredLocation: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: {
            type: String,
            select: false,
        },
        resetPasswordExpires: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent Next.js hot reload from compiling model multiple times
export const User =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
