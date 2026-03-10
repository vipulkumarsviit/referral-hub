import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Application } from "@/models/Application";
import { JobListing } from "@/models/JobListing";
import { User } from "@/models/User";
import { auth } from "@/auth";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const application = await Application.findById(params.id);
        if (!application) {
            return NextResponse.json({ message: "Application not found" }, { status: 404 });
        }

        const isParticipant =
            application.jobSeekerId.toString() === session.user.id ||
            application.referrerId.toString() === session.user.id;

        if (!isParticipant) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const job = await JobListing.findById(application.jobId).lean();
        if (!job) {
            return NextResponse.json({ message: "Job not found" }, { status: 404 });
        }

        const referrer = await User.findById(application.referrerId).lean();

        return NextResponse.json(
            {
                position: job.title,
                company: job.company,
                referrerName: referrer?.name ?? null,
                referrerPosition: referrer?.jobTitle ?? null,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Application meta error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

