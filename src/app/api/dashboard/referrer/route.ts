import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { JobListing } from "@/models/JobListing";
import { Application } from "@/models/Application";
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

        // Fetch active listings
        const listings = await JobListing.find({ referrerId: userId, status: "active" })
            .sort({ createdAt: -1 })
            .lean();

        // Get application counts for these listings
        const listingIds = listings.map((l) => l._id);

        const applicantsPromise = Application.aggregate([
            { $match: { jobId: { $in: listingIds } } },
            { $group: { _id: "$jobId", count: { $sum: 1 } } }
        ]);

        const allApplicationsPromise = Application.find({ referrerId: userId }).lean();

        const [applicantCounts, allApplications] = await Promise.all([
            applicantsPromise,
            allApplicationsPromise
        ]);

        const countMap = applicantCounts.reduce((acc, curr) => {
            acc[curr._id.toString()] = curr.count;
            return acc;
        }, {} as Record<string, number>);

        const enrichedListings = listings.map((l) => ({
            ...l,
            applicantCount: countMap[l._id.toString()] || 0,
        }));

        const totalApplicants = allApplications.length;
        const acceptedApplicants = allApplications.filter((a) => a.status === "Accepted").length;

        return NextResponse.json({
            listings: enrichedListings,
            totalApplicants,
            acceptedApplicants,
        }, { status: 200 });
    } catch (error: any) {
        console.error("Dashboard error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
