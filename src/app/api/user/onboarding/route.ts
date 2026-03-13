import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        await dbConnect();

        const updateData: Record<string, any> = {};
        const isReferrer = (session.user as any).role === "referrer";

        const setIfDefined = (key: string, value: any) => {
            if (value !== undefined) {
                updateData[key] = value;
            }
        };

        if (isReferrer) {
            setIfDefined("company", data.company);
            setIfDefined("jobTitle", data.jobTitle);
            setIfDefined("linkedIn", data.linkedIn);
            setIfDefined("bio", data.bio);
        } else {
            setIfDefined("jobTitle", data.jobTitle);
            if (data.skills !== undefined) {
                setIfDefined(
                    "skills",
                    Array.isArray(data.skills)
                        ? data.skills
                        : String(data.skills)
                            .split(",")
                            .map((skill: string) => skill.trim())
                            .filter(Boolean)
                );
            }
            setIfDefined("linkedIn", data.linkedIn);
            setIfDefined("preferredRole", data.preferredRole);
            setIfDefined("preferredLocation", data.preferredLocation);
            setIfDefined("resumeUrl", data.resumeUrl);
        }

        if (Object.keys(updateData).length > 0) {
            await User.findByIdAndUpdate(session.user.id, updateData);
        }

        return NextResponse.json(
            { message: "Onboarding completed successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Onboarding error:", error);
        return NextResponse.json(
            { message: "An error occurred during onboarding" },
            { status: 500 }
        );
    }
}
