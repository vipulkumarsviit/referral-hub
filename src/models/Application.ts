import mongoose from "mongoose";

export type ApplicationStatus = "Applied" | "Viewed" | "Accepted" | "Declined";

export interface IApplication extends mongoose.Document {
    jobId: mongoose.Types.ObjectId;
    jobSeekerId: mongoose.Types.ObjectId;
    referrerId: mongoose.Types.ObjectId;
    resumeUrl?: string;
    note?: string;
    status: ApplicationStatus;
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema = new mongoose.Schema<IApplication>(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobListing",
            required: true,
        },
        jobSeekerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        referrerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        resumeUrl: {
            type: String,
        },
        note: {
            type: String,
            maxlength: [200, "Note cannot be more than 200 characters"],
        },
        status: {
            type: String,
            enum: ["Applied", "Viewed", "Accepted", "Declined"],
            default: "Applied",
        },
    },
    {
        timestamps: true,
    }
);

// Prevent a job seeker from applying to the same job multiple times
ApplicationSchema.index({ jobId: 1, jobSeekerId: 1 }, { unique: true });

export const Application =
    mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema);
