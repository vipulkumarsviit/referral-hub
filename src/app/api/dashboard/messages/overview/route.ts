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

        // Find all accepted applications where the user is either party
        const apps = await Application.find({
            $or: [
                { referrerId: session.user.id },
                { jobSeekerId: session.user.id },
            ],
            status: "Accepted",
        })
            .sort({ updatedAt: -1 })
            .lean();

        const otherUserIds = apps.map((a) => {
            const isReferrer = a.referrerId.toString() === session.user!.id;
            return isReferrer ? a.jobSeekerId : a.referrerId;
        });
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
            const isReferrer = a.referrerId.toString() === session.user!.id;
            const other = isReferrer
                ? (userMap.get(a.jobSeekerId.toString()) as any)
                : (userMap.get(a.referrerId.toString()) as any);
            const last = lastMap.get(a._id.toString()) as any;
            const preview = last?.content?.slice(0, 60) || "Accepted application";
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

