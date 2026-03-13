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
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?verify=work-email&status=invalid`);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await dbConnect();
    const user = await User.findOne({
      workEmailVerifyToken: hashedToken,
      workEmailVerifyExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?verify=work-email&status=invalid`);
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: { workEmailVerified: true },
        $unset: { workEmailVerifyToken: "", workEmailVerifyExpires: "" },
      }
    );

    return NextResponse.redirect(`${baseUrl}/dashboard/settings?verify=work-email&status=success`);
  } catch {
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?verify=work-email&status=error`);
  }
}
