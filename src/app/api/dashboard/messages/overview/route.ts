import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import { Message } from "@/models/Message";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const role = (session.user as any).role as "seeker" | "referrer";

        const apps =
            role === "referrer"
                ? await Application.find({ referrerId: session.user.id, status: "Accepted" })
                      .sort({ updatedAt: -1 })
                      .lean()
                : await Application.find({ jobSeekerId: session.user.id, status: "Accepted" })
                      .sort({ updatedAt: -1 })
                      .lean();

        const otherUserIds = apps.map((a) =>
            role === "referrer" ? a.jobSeekerId : a.referrerId
        );
        const users = await User.find({ _id: { $in: otherUserIds } }).lean();
        const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

        const lastMessages = await Promise.all(
            apps.map(async (a: any) => {
                const m = await Message.findOne({ applicationId: a._id })
                    .sort({ createdAt: -1 })
                    .lean();
                return [a._id.toString(), m] as const;
            })
        );
        const lastMap = new Map(lastMessages);

        const items = apps.map((a: any) => {
            const other =
                role === "referrer"
                    ? (userMap.get(a.jobSeekerId.toString()) as any)
                    : (userMap.get(a.referrerId.toString()) as any);
            const last = lastMap.get(a._id.toString()) as any;
            const preview =
                last?.content?.slice(0, 60) ||
                (role === "referrer" ? "Accepted applicant" : "Accepted by referrer");
            const initials =
                String(other?.name || "?")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p: string) => p[0]?.toUpperCase())
                    .join("") || "?";
            return {
                appId: a._id.toString(),
                name: other?.name || "Unknown",
                initials,
                preview,
            };
        });

        return NextResponse.json({ items }, { status: 200 });
    } catch (error) {
        console.error("Messages overview error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

