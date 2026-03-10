import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/email";
import { resetPasswordEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: normalizedEmail }).select("_id email");

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      console.log("token", token);
      console.log("hashedToken", hashedToken);
      console.log("expires", expires);
      console.log("user._id", user._id);

      await User.updateOne(
        { _id: user._id },
        { $set: { resetPasswordToken: hashedToken, resetPasswordExpires: expires } }
      );

      const baseUrl =
        process.env.NEXTAUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      try {
        const template = resetPasswordEmail({ resetUrl, logoUrl: `${baseUrl}/icon.svg` });
        await sendEmail({
          to: user.email,
          subject: template.subject,
          text: template.text,
          html: template.html,
        });
      } catch {
        // Ignore email errors to avoid enumeration.
      }
    }

    return NextResponse.json(
      { message: "If that email exists, a reset link has been sent." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
