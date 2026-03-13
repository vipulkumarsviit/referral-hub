import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { JobListing } from "@/models/JobListing";
import { auth } from "@/auth";
import { User } from "@/models/User";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if ((session.user as any).role === "admin") {
            return NextResponse.json({ message: "Admins cannot create listings." }, { status: 403 });
        }

        const data = await req.json();
        await dbConnect();

        const totalListingsCount = await JobListing.countDocuments({
            referrerId: session.user.id,
        });

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (totalListingsCount >= 5 && !user.workEmailVerified) {
            return NextResponse.json(
                { message: "Please verify your work email to post more than 5 referrals." },
                { status: 403 }
            );
        }

        // Fetch company from profile
        if (!user.company) {
            return NextResponse.json(
                { message: "Please complete your profile to add a company before posting a listing." },
                { status: 400 }
            );
        }

        const newListing = await JobListing.create({
            referrerId: session.user.id,
            company: user.company,
            title: data.title,
            location: data.location,
            roleType: data.roleType,
            description: data.description,
            experienceLevel: data.experienceLevel,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
            status: "active",
        });

        return NextResponse.json(
            { message: "Listing created successfully", listing: newListing },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create listing error:", error);
        return NextResponse.json(
            { message: "An error occurred" },
            { status: 500 }
        );
    }
}
