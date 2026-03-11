import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { JobListing } from "@/models/JobListing";

const fallbackCompanies = ["Google", "Stripe", "Linear", "Notion"];

export async function GET() {
  try {
    await dbConnect();
    const companies = await JobListing.distinct("company", { status: "active" });
    const list = (companies.length ? companies : fallbackCompanies).slice(0, 8);
    return NextResponse.json({ companies: list }, { status: 200 });
  } catch {
    return NextResponse.json({ companies: fallbackCompanies }, { status: 200 });
  }
}
