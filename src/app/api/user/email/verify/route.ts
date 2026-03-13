import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";
import { accountEmailVerificationEmail } from "@/lib/email-templates";

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email?.toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select("isVerified");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Email already verified." }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.collection.updateOne(
      { _id: user._id },
      { $set: { emailVerifyToken: hashedToken, emailVerifyExpires: expires } }
    );

    const rawUpdated = await User.collection.findOne(
      { _id: user._id },
      { projection: { emailVerifyToken: 1, emailVerifyExpires: 1 } }
    );

    if (!rawUpdated?.emailVerifyToken || !rawUpdated?.emailVerifyExpires) {
      return NextResponse.json(
        {
          message: "Unable to set verification token.",
          ...(process.env.NODE_ENV !== "production"
            ? {
                debug: {
                  storedToken: Boolean(rawUpdated?.emailVerifyToken),
                  storedExpires: Boolean(rawUpdated?.emailVerifyExpires),
                  userId: user._id?.toString?.() ?? String(user._id),
                },
              }
            : {}),
        },
        { status: 500 }
      );
    }


    const baseUrl =
      process.env.NEXTAUTH_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/user/email/confirm?token=${token}`;

    const template = accountEmailVerificationEmail({ verifyUrl, logoUrl: `${baseUrl}/icon.svg` });

    try {
      await sendEmail({
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      return NextResponse.json({ message: "Verification email sent." }, { status: 200 });
    } catch {
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(
          {
            message: "Verification email skipped in dev.",
            verifyUrl,
            debug: {
              tokenSet: Boolean(rawUpdated?.emailVerifyToken),
              expiresSet: Boolean(rawUpdated?.emailVerifyExpires),
            },
          },
          { status: 200 }
        );
      }
      return NextResponse.json({ message: "Unable to send verification email." }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ message: "Unable to send verification email." }, { status: 500 });
  }
}
