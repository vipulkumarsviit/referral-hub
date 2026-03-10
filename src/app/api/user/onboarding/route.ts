import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        await dbConnect();

        const updateData: any = {};
        const isReferrer = (session.user as any).role === "referrer";

        if (isReferrer) {
            updateData.company = data.company;
            updateData.jobTitle = data.jobTitle;
            updateData.linkedIn = data.linkedIn;
            updateData.bio = data.bio;
            updateData.isVerified = true; // Auto-verify for MVP
        } else {
            updateData.jobTitle = data.jobTitle;
            updateData.skills = data.skills;
            updateData.linkedIn = data.linkedIn;
            updateData.preferredRole = data.preferredRole;
            updateData.preferredLocation = data.preferredLocation;
            updateData.resumeUrl = data.resumeUrl;
        }

        await User.findByIdAndUpdate(session.user.id, updateData);

        return NextResponse.json(
            { message: "Onboarding completed successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Onboarding error:", error);
        return NextResponse.json(
            { message: "An error occurred during onboarding" },
            { status: 500 }
        );
    }
}
