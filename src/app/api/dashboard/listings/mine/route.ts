import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { JobListing, IJobListing } from "@/models/JobListing";
import { Application } from "@/models/Application";
import { auth } from "@/auth";

type ListingWithCounts = IJobListing & { applicants: number };

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const listings = await JobListing.find({ referrerId: session.user.id })
            .sort({ createdAt: -1 })
            .lean<IJobListing[]>();

        const ids = listings.map((l) => l._id);
        const counts = await Application.aggregate<{ _id: string; count: number }>([
            { $match: { jobId: { $in: ids } } },
            { $group: { _id: "$jobId", count: { $sum: 1 } } },
        ]);
        const countMap = new Map<string, number>(counts.map((c) => [String(c._id), c.count]));

        const withCounts: ListingWithCounts[] = listings.map((l) =>
            Object.assign(l, { applicants: countMap.get(String(l._id)) ?? 0 })
        ) as unknown as ListingWithCounts[];

        return NextResponse.json({ listings: withCounts }, { status: 200 });
    } catch (error) {
        console.error("My listings error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
