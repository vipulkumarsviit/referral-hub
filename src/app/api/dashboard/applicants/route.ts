import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Application, IApplication } from "@/models/Application";
import { User, IUser } from "@/models/User";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as unknown as { role?: string })?.role;
        if (role !== "referrer") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await dbConnect();

        const apps = await Application.find({ referrerId: session.user.id })
            .sort({ createdAt: -1 })
            .lean<IApplication[]>();

        const seekerIds = apps.map((a) => a.jobSeekerId);
        const seekers = await User.find({ _id: { $in: seekerIds } }).lean<IUser[]>();
        const seekerMap = new Map(seekers.map((u) => [u._id.toString(), u]));

        const items = apps.map((a) => {
            const u = seekerMap.get(a.jobSeekerId.toString()) as Partial<IUser> | undefined;
            const skills = ((u as unknown) as { skills?: string[] } | undefined)?.skills ?? [];
            return {
                _id: a._id.toString(),
                status: a.status as string,
                resumeUrl: a.resumeUrl,
                createdAt: a.createdAt,
                user: {
                    name: u?.name || "Unknown",
                    jobTitle: u?.jobTitle || "—",
                    image: u?.image || "",
                    skills,
                },
            };
        });

        return NextResponse.json({ items }, { status: 200 });
    } catch (error) {
        console.error("Applicants dashboard error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

