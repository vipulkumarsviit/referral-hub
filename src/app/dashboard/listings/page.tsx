import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Users } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function MyListingsPage() {
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

    const res = await fetch(`${baseUrl}/api/dashboard/listings/mine`, {
        cache: "no-store",
        headers: {
            Cookie: cookieHeader,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to load listings");
    }

    const { listings: withCounts } = await res.json();

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark">My Listings</h1>
                    <p className="mt-2 text-brand-dark/60">
                        Manage your referral posts and review applicants.
                    </p>
                </div>
                <Link href="/dashboard/listings/new">
                    <Button className="px-6 font-bold">Post New Referral</Button>
                </Link>
            </div>

            {withCounts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand-dark/20 p-12 text-center text-brand-dark/60">
                    You have no active listings yet. Create your first one to start receiving applicants.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {withCounts.map((job: any) => (
                        <Card key={String(job._id)} className="border-brand-dark/10 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="text-xl font-extrabold text-brand-dark">{job.title}</span>
                                    <Badge
                                        className={job.status === "active" ? "bg-success text-white" : "bg-brand-dark/10 text-brand-dark"}
                                    >
                                        {job.status}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-2">
                                    <div className="text-brand-dark/80 font-medium flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-brand-dark/50" />
                                        {job.company}
                                    </div>
                                    <div className="text-brand-dark/60 text-sm flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-brand-dark/40" />
                                        {job.location} • {job.roleType} • {job.experienceLevel}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 rounded-xl bg-brand-dark/5 px-3 py-2">
                                        <Users className="h-4 w-4 text-brand-dark/60" />
                                        <span className="text-sm font-bold text-brand-dark">{job.applicants}</span>
                                        <span className="text-sm text-brand-dark/60">Applicants</span>
                                    </div>
                                    <Link href={`/dashboard/listings/${String(job._id)}`}>
                                        <Button variant="outline" size="sm" className="font-semibold">
                                            View Applicants
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
