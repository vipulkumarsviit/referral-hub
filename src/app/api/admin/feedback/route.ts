import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import { Feedback } from "@/models/Feedback";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: "seeker" | "referrer" | "admin" })?.role;

  if (!session || role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const serialized = feedback.map((item) => ({
      id: item._id.toString(),
      type: item.type,
      email: item.email,
      message: item.message,
      status: item.status,
      createdAt: item.createdAt,
      userId: item.userId ? item.userId.toString() : undefined,
    }));

    return NextResponse.json({ feedback: serialized }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to load feedback" }, { status: 500 });
  }
}
