import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Feedback } from "@/models/Feedback";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const { type, email, message } = (await req.json()) as {
      type?: string;
      email?: string;
      message?: string;
    };

    if (!type || !["issue", "feature"].includes(type)) {
      return NextResponse.json({ message: "Invalid feedback type." }, { status: 400 });
    }

    if (!message || message.trim().length < 5) {
      return NextResponse.json({ message: "Please add more detail in your message." }, { status: 400 });
    }

    await dbConnect();
    const session = await auth();

    await Feedback.create({
      type,
      email: email?.trim() || undefined,
      message: message.trim(),
      userId: session?.user ? (session.user as any).id : undefined,
    });

    return NextResponse.json({ message: "Feedback received." }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to submit feedback right now." }, { status: 500 });
  }
}
