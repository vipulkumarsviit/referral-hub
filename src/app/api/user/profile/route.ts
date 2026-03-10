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

        const data = await req.json();
        await dbConnect();

        // Ensure user is not tampering with their role or isVerified status
        delete data.role;
        delete data.isVerified;

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
