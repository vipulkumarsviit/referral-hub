import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import { auth } from "@/auth";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Verify application
        const application = await Application.findById(params.id);
        if (!application || application.status !== "Accepted") {
            return NextResponse.json({ message: "Not found or not accepted yet" }, { status: 404 });
        }

        // Verify user is part of the application
        const isParticipant =
            application.jobSeekerId.toString() === session.user.id ||
            application.referrerId.toString() === session.user.id;

        if (!isParticipant) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const messages = await Message.find({ applicationId: params.id })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({ messages }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const application = await Application.findById(params.id);
        if (!application || application.status !== "Accepted") {
            return NextResponse.json({ message: "Not found or not accepted yet" }, { status: 404 });
        }

        const isSeeker = application.jobSeekerId.toString() === session.user.id;
        const isReferrer = application.referrerId.toString() === session.user.id;

        if (!isSeeker && !isReferrer) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { content } = await req.json();
        if (!content?.trim()) {
            return NextResponse.json({ message: "Message cannot be empty" }, { status: 400 });
        }

        const receiverId = isSeeker ? application.referrerId : application.jobSeekerId;

        const newMessage = await Message.create({
            senderId: session.user.id,
            receiverId,
            applicationId: application._id,
            content: content.trim()
        });

        return NextResponse.json({ message: newMessage }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
