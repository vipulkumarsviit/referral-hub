import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import { Feedback } from "@/models/Feedback";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: "seeker" | "referrer" | "admin" })?.role;

  if (!session || role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { status } = (await req.json()) as { status?: string };
    if (!status || !["new", "reviewed"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    await dbConnect();
    const updated = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json({ feedback: updated }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to update feedback" }, { status: 500 });
  }
}
