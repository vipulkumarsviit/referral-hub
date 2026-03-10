import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@/auth";

export async function GET(req: Request) {
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
    } catch (error: any) {
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
        const allowedFields = [
            "name",
            "jobTitle",
            "company",
            "bio",
            "linkedIn",
            "resumeUrl",
            "skills",
            "preferredRole",
            "preferredLocation",
            "image",
        ] as const;

        // Build a sanitized payload
        const data: Record<string, any> = {};
        for (const key of allowedFields) {
            if (typeof body[key] !== "undefined") data[key] = body[key];
        }

        // Normalize skills from comma-separated string -> string[]
        if (typeof data.skills === "string") {
            data.skills = (data.skills as string)
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
        await dbConnect();

        // Ensure user is not tampering with their role or isVerified status
        delete (data as any).role;
        delete (data as any).isVerified;
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: data },
            { new: true }
        );

        return NextResponse.json({ user: updatedUser, message: "Profile updated" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
