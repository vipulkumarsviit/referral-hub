import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET(req: Request) {
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    if (!token) {
      return NextResponse.redirect(`${baseUrl}/onboarding?verify=email&status=invalid&step=4`);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    await dbConnect();
    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/onboarding?verify=email&status=invalid&step=4`);
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { emailVerifyToken: "", emailVerifyExpires: "" },
      }
    );

    return NextResponse.redirect(
      `${baseUrl}/onboarding?verify=email&status=success&step=4`
    );
  } catch {
    return NextResponse.redirect(`${baseUrl}/onboarding?verify=email&status=error&step=4`);
  }
}
