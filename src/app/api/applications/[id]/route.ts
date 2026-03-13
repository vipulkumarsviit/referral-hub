import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Application } from "@/models/Application";
import { auth } from "@/auth";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const session = await auth();
        if (!session || !session.user || ((session.user as any).role !== "user" && (session.user as any).role !== "admin")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { status } = data; // "Accepted" or "Declined"

        if (!["Accepted", "Declined"].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        await dbConnect();

        // Verify application exists and belongs to the referrer
        const application = await Application.findOne({
            _id: params.id,
            referrerId: session.user.id
        });

        if (!application) {
            return NextResponse.json({ message: "Application not found or unauthorized" }, { status: 404 });
        }

        application.status = status;
        await application.save();

        return NextResponse.json({ message: `Application ${status.toLowerCase()} successfully`, application }, { status: 200 });

    } catch (error: any) {
        console.error("Update application error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
