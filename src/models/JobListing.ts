import mongoose from "mongoose";

export type RoleType = "Full-time" | "Part-time" | "Contract";
export type ExperienceLevel = "Entry" | "Mid" | "Senior";
export type JobStatus = "active" | "expired";

export interface IJobListing extends mongoose.Document {
    referrerId: mongoose.Types.ObjectId;
    company: string;
    title: string;
    location: string;
    roleType: RoleType;
    description: string;
    experienceLevel: ExperienceLevel;
    deadline?: Date;
    status: JobStatus;
    createdAt: Date;
    updatedAt: Date;
}

const JobListingSchema = new mongoose.Schema<IJobListing>(
    {
        referrerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        company: {
            type: String,
            required: [true, "Company name is required"],
        },
        title: {
            type: String,
            required: [true, "Job title is required"],
        },
        location: {
            type: String,
            required: [true, "Job location is required"],
        },
        roleType: {
            type: String,
            enum: ["Full-time", "Part-time", "Contract"],
            required: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: [300, "Description cannot be more than 300 characters"],
        },
        experienceLevel: {
            type: String,
            enum: ["Entry", "Mid", "Senior"],
            required: true,
        },
        deadline: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["active", "expired"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

export const JobListing =
    mongoose.models.JobListing || mongoose.model<IJobListing>("JobListing", JobListingSchema);
