import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import { Message } from "@/models/Message";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Find all accepted applications where the user is either party
        const apps = await Application.find({
            $or: [
                { referrerId: session.user.id },
                { jobSeekerId: session.user.id },
            ],
            status: "Accepted",
        })
            .sort({ updatedAt: -1 })
            .lean();

        const otherUserIds = apps.map((a) => {
            const isReferrer = a.referrerId.toString() === session.user!.id;
            return isReferrer ? a.jobSeekerId : a.referrerId;
        });
        const users = await User.find({ _id: { $in: otherUserIds } }).lean();
        const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

        // Fetch Job Listings for contexts
        const jobIds = apps.map((a) => a.jobId);
        const { JobListing } = await import("@/models/JobListing"); // Dynamic import to avoid circular dep if any, or just import at top. Actually let's use the model directly.
        const jobs = await JobListing.find({ _id: { $in: jobIds } }).lean();
        const jobMap = new Map(jobs.map((j: any) => [j._id.toString(), j]));

        const lastMessages = await Promise.all(
            apps.map(async (a: any) => {
                const m = await Message.findOne({ applicationId: a._id })
                    .sort({ createdAt: -1 })
                    .lean();
                return [a._id.toString(), m] as const;
            })
        );
        const lastMap = new Map(lastMessages);

        const mappedApps = apps.map((a: any) => {
            const isSeeker = a.jobSeekerId.toString() === session.user!.id;
            const other = isSeeker
                ? (userMap.get(a.referrerId.toString()) as any)
                : (userMap.get(a.jobSeekerId.toString()) as any);
            const job = jobMap.get(a.jobId.toString()) as any;
            const last = lastMap.get(a._id.toString()) as any;
            const preview = last?.content?.slice(0, 60) || "Accepted application";
            const initials =
                String(other?.name || "?")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p: string) => p[0]?.toUpperCase())
                    .join("") || "?";
            
            return {
                appId: a._id.toString(),
                jobId: a.jobId.toString(),
                name: other?.name || "Unknown",
                position: job?.title || "Application",
                company: job?.company || "Company",
                initials,
                preview,
                status: a.status || "Pending",
                createdAt: a.createdAt,
                isSeeker, // whether current user is the seeker for this app
                updatedAt: a.updatedAt,
            };
        });

        const seekerApplications = mappedApps.filter((ma) => ma.isSeeker);
        const referrerApps = mappedApps.filter((ma) => !ma.isSeeker);

        const jobGroups = new Map();
        for (const rap of referrerApps) {
            if (!jobGroups.has(rap.jobId)) {
                jobGroups.set(rap.jobId, {
                    jobId: rap.jobId,
                    position: rap.position,
                    company: rap.company,
                    updatedAt: rap.updatedAt,
                    applicants: [],
                });
            }
            jobGroups.get(rap.jobId).applicants.push(rap);
        }

        const referrerJobs = Array.from(jobGroups.values()).sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        return NextResponse.json({ seekerApplications, referrerJobs }, { status: 200 });
    } catch (error) {
        console.error("Messages overview error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

