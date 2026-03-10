import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { JobListing } from "@/models/JobListing";
import { Application } from "@/models/Application";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const role = (session.user as { role?: "seeker" | "referrer" | "admin" })?.role;
        if (role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await dbConnect();

        const [totalUsers, totalReferrers, totalSeekers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "referrer" }),
            User.countDocuments({ role: "seeker" }),
        ]);

        const [totalListings, activeListings] = await Promise.all([
            JobListing.countDocuments(),
            JobListing.countDocuments({ status: "active" }),
        ]);

        const [totalApplications, acceptedApplications] = await Promise.all([
            Application.countDocuments(),
            Application.countDocuments({ status: "Accepted" }),
        ]);

        const [users, listings] = await Promise.all([
            User.find().sort({ createdAt: -1 }).limit(10).lean(),
            JobListing.find().sort({ createdAt: -1 }).limit(10).lean(),
        ]);

        return NextResponse.json(
            {
                totalUsers,
                totalReferrers,
                totalSeekers,
                totalListings,
                activeListings,
                totalApplications,
                acceptedApplications,
                users,
                listings,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Admin overview error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
