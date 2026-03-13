import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Application } from "@/models/Application";
import { JobListing } from "@/models/JobListing";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if ((session.user as any).role === "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await dbConnect();
        const userId = session.user.id;

        // Fetch applications for this user
        const applications = await Application.find({ jobSeekerId: userId })
            .sort({ createdAt: -1 })
            .lean();

        // Populate job details
        const jobIds = applications.map((a) => a.jobId);
        const jobs = await JobListing.find({ _id: { $in: jobIds } }).lean();

        const jobMap = jobs.reduce((acc, curr) => {
            acc[curr._id.toString()] = curr;
            return acc;
        }, {} as Record<string, any>);

        const enrichedApplications = applications.map((a) => ({
            ...a,
            jobTitle: jobMap[a.jobId.toString()]?.title || "Unknown Role",
            company: jobMap[a.jobId.toString()]?.company || "Unknown Company",
        }));

        return NextResponse.json({ applications: enrichedApplications }, { status: 200 });
    } catch (error: any) {
        console.error("Seeker Dashboard error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
