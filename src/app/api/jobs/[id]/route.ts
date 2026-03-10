import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { JobListing } from "@/models/JobListing";
import { User } from "@/models/User";
import { Application } from "@/models/Application";
import { auth } from "@/auth";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;

        await dbConnect();

        const job = await JobListing.findById(params.id).lean();
        if (!job) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        const referrer = await User.findById(job.referrerId).lean();
        const session = await auth();

        let missingResume = false;
        let hasApplied = false;

        if (session?.user?.id) {
            const me = await User.findById(session.user.id).lean();
            const role = (session.user as unknown as { role?: string })?.role;
            missingResume = role === "seeker" && (!me || !me.resumeUrl);
            if (role === "seeker") {
                const existing = await Application.findOne({
                    jobId: job._id,
                    jobSeekerId: session.user.id,
                }).lean();
                hasApplied = Boolean(existing);
            }
        }

        return NextResponse.json(
            {
                job,
                referrer,
                missingResume,
                hasApplied,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Job detail error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

