import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();
        const currentUser = await User.findById(session.user.id).select("role workEmail");
        if (!currentUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const role = currentUser.role as "seeker" | "referrer" | "admin";

        const commonFields = ["name", "jobTitle", "bio", "image", "company", "workEmail"] as const;
        const seekerOnlyFields = ["linkedIn", "resumeUrl", "skills", "preferredRole", "preferredLocation"] as const;

        const allowedFields = new Set<string>([...commonFields]);
        if (role === "seeker" || role === "referrer") {
            seekerOnlyFields.forEach((f) => allowedFields.add(f));
        }

        // Build a sanitized payload
        const data: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (typeof body[key] !== "undefined") {
                data[key] = body[key];
            }
        }

        // Normalize skills from comma-separated string -> string[]
        if (typeof data.skills === "string") {
            data.skills = data.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
        }

        // Basic normalization for resumeUrl and linkedIn
        if (typeof data.resumeUrl === "string") {
            data.resumeUrl = data.resumeUrl.trim();
        }
        if (typeof data.linkedIn === "string") {
            data.linkedIn = data.linkedIn.trim();
        }
        if (typeof data.workEmail === "string") {
            data.workEmail = data.workEmail.trim().toLowerCase();
        }

        // Ensure user is not tampering with their role or isVerified status
        delete data.role;
        delete data.isVerified;

        if (
            typeof data.workEmail === "string" &&
            data.workEmail &&
            data.workEmail !== currentUser.workEmail
        ) {
            data.workEmailVerified = false;
        }
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: data },
            { new: true }
        );

        return NextResponse.json({ user: updatedUser, message: "Profile updated" }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
