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

        const referrerDoc = await User.findById(job.referrerId).lean();
        const session = await auth();

        let missingResume = false;
        let hasApplied = false;
        let referrerStats = { received: 0, accepted: 0 };
        let listingStats = { received: 0, accepted: 0 };

        if (session?.user?.id) {
            const me = await User.findById(session.user.id).lean();
            const role = (session.user as unknown as { role?: string })?.role;
            missingResume = role !== "admin" && (!me || !me.resumeUrl);
            const existing = await Application.findOne({
                jobId: job._id,
                jobSeekerId: session.user.id,
            }).lean();
            hasApplied = Boolean(existing);
        }

        const referrer = referrerDoc
            ? {
                name: referrerDoc.name,
                jobTitle: referrerDoc.jobTitle,
                company: referrerDoc.company,
                isVerified: referrerDoc.isVerified,
                image: referrerDoc.image,
            }
            : null;

        if (referrerDoc?._id) {
            const [received, accepted] = await Promise.all([
                Application.countDocuments({ referrerId: referrerDoc._id }),
                Application.countDocuments({ referrerId: referrerDoc._id, status: "Accepted" }),
            ]);
            referrerStats = { received, accepted };
        }

        if (job?._id) {
            const [received, accepted] = await Promise.all([
                Application.countDocuments({ jobId: job._id }),
                Application.countDocuments({ jobId: job._id, status: "Accepted" }),
            ]);
            listingStats = { received, accepted };
        }

        return NextResponse.json(
            {
                job,
                referrer,
                referrerStats,
                listingStats,
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
