import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { JobListing } from "@/models/JobListing";
import { Application } from "@/models/Application";
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

        if ((session.user as any).role !== "user" && (session.user as any).role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await dbConnect();

        const job = await JobListing.findById(params.id).lean();
        if (!job || job.referrerId.toString() !== session.user.id) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        const applications = await Application.find({ jobId: job._id })
            .sort({ createdAt: -1 })
            .lean();

        const seekerIds = applications.map((a) => a.jobSeekerId);
        const seekers = await User.find({ _id: { $in: seekerIds } }).lean();

        const seekerMap = seekers.reduce((acc, curr) => {
            acc[curr._id.toString()] = curr;
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json(
            {
                job,
                applications,
                seekers: seekerMap,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Listing detail error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

