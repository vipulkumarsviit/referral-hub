import ApplicantsList from "./ApplicantsList";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ApplicantsPage() {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/login");
    }
    const role = (session.user as unknown as { role?: string })?.role;
    if (role !== "referrer") {
        redirect("/dashboard");
    }

    const baseUrl =
        process.env.NEXTAUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
        throw new Error("Base URL is not configured (set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL)");
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${baseUrl}/api/dashboard/applicants`, {
        cache: "no-store",
        headers: {
            Cookie: cookieHeader,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to load applicants");
    }

    const { items } = await res.json();

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-brand-dark">Applicants</h1>
                <p className="mt-2 text-brand-dark/60">
                    Manage and review potential candidates for your referred positions.
                </p>
            </div>
            <ApplicantsList items={items} />
        </div>
    );
}
