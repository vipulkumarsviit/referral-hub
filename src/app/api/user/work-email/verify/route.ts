import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";
import { workEmailVerificationEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { workEmail } = (await req.json()) as { workEmail?: string };
    const normalized = typeof workEmail === "string" ? workEmail.trim().toLowerCase() : "";

    await dbConnect();
    const user = await User.findById(session.user.id).select("workEmail");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const emailToVerify = normalized || user.workEmail || "";
    if (!emailToVerify) {
      return NextResponse.json({ message: "Work email is required." }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          workEmail: emailToVerify,
          workEmailVerified: false,
          workEmailVerifyToken: hashedToken,
          workEmailVerifyExpires: expires,
        },
      }
    );

    const baseUrl =
      process.env.NEXTAUTH_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/user/work-email/confirm?token=${token}`;

    const template = workEmailVerificationEmail({ verifyUrl, logoUrl: `${baseUrl}/icon.svg` });
    try {
      await sendEmail({
        to: emailToVerify,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      return NextResponse.json({ message: "Verification email sent." }, { status: 200 });
    } catch {
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(
          { message: "Verification email skipped in dev.", verifyUrl },
          { status: 200 }
        );
      }
      return NextResponse.json({ message: "Unable to send verification email." }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ message: "Unable to send verification email." }, { status: 500 });
  }
}
