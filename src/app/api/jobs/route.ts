import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { JobListing } from "@/models/JobListing";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const url = new URL(req.url);
        const search = url.searchParams.get("q") || "";
        const roleType = url.searchParams.get("roleType") || "";
        const experienceLevel = url.searchParams.get("experienceLevel") || "";

        const query: any = { status: "active" };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }

        if (roleType) {
            query.roleType = roleType;
        }

        if (experienceLevel) {
            query.experienceLevel = experienceLevel;
        }

        const listings = await JobListing.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ listings }, { status: 200 });
    } catch (error: any) {
        console.error("Fetch jobs error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
