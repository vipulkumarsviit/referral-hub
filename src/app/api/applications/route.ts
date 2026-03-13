import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Application } from "@/models/Application";
import { JobListing } from "@/models/JobListing";
import { User } from "@/models/User";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if ((session.user as any).role === "admin") {
            return NextResponse.json({ message: "Admins cannot apply for referrals" }, { status: 403 });
        }

        const data = await req.json();
        const { jobId, note } = data;

        if (!jobId) {
            return NextResponse.json({ message: "Job ID is required" }, { status: 400 });
        }

        await dbConnect();
        const userId = session.user.id;

        // Ensure user has completed profile (resumeUrl)
        const user = await User.findById(userId);
        if (!user || !user.resumeUrl) {
            return NextResponse.json({ message: "Please complete your profile and add a resume link before applying." }, { status: 400 });
        }

        // Fetch job to get referrerId
        const job = await JobListing.findById(jobId);
        if (!job || job.status !== "active") {
            return NextResponse.json({ message: "Job listing is no longer active" }, { status: 404 });
        }

        if (String(job.referrerId) === String(userId)) {
            return NextResponse.json({ message: "You cannot apply to your own referral listing." }, { status: 403 });
        }

        // Check if already applied
        const existingApp = await Application.findOne({ jobId: job._id, jobSeekerId: userId });
        if (existingApp) {
            return NextResponse.json({ message: "You have already applied for this referral" }, { status: 409 });
        }

        // Check limits (10 per month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const appsThisMonth = await Application.countDocuments({
            jobSeekerId: userId,
            createdAt: { $gte: startOfMonth }
        });

        if (appsThisMonth >= 10) {
            return NextResponse.json({ message: "You have reached your monthly limit of 10 applications." }, { status: 429 });
        }

        // Create application
        const newApp = await Application.create({
            jobId: job._id,
            jobSeekerId: userId,
            referrerId: job.referrerId,
            resumeUrl: user.resumeUrl,
            note: note,
            status: "Applied"
        });

        return NextResponse.json({ message: "Application submitted successfully", application: newApp }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ message: "You have already applied for this referral" }, { status: 409 });
        }
        console.error("Apply error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
