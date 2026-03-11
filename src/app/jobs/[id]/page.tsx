import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Briefcase, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import ApplyButton from "./ApplyButton"; // Client component
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const baseUrl =
        process.env.NEXTAUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
        throw new Error("Base URL is not configured (set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL)");
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${baseUrl}/api/jobs/${params.id}`, {
        cache: "no-store",
        headers: {
            Cookie: cookieHeader,
        },
    });

    if (res.status === 404) return notFound();
    if (!res.ok) {
        throw new Error("Failed to load job details");
    }

    const { job, referrer, missingResume, hasApplied } = await res.json();

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
                <Link href="/jobs" className="inline-flex items-center text-sm font-semibold text-brand-dark/60 hover:text-primary mb-8 transition-colors">
                    ← Back to Jobs
                </Link>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-brand-dark/5 border border-brand-dark/5 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-brand-dark rounded-2xl text-white">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-brand-dark leading-tight">{job.company}</h2>
                                    {referrer && (
                                        <p className="text-sm font-medium text-brand-dark/60">
                                            Referral via {referrer.name} {referrer.isVerified && <span className="text-success ml-1">✓</span>}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-brand-dark mb-4 leading-[1.1] tracking-tight">
                                {job.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="secondary" className="bg-primary/10 text-primary py-1.5 px-3 font-bold border-none">
                                    {job.experienceLevel} Level
                                </Badge>
                                <span className="flex items-center text-sm font-semibold text-brand-dark/70 bg-brand-dark/5 py-1.5 px-3 rounded-full">
                                    <MapPin className="mr-1.5 h-4 w-4" /> {job.location}
                                </span>
                                <span className="flex items-center text-sm font-semibold text-brand-dark/70 bg-brand-dark/5 py-1.5 px-3 rounded-full">
                                    <Briefcase className="mr-1.5 h-4 w-4" /> {job.roleType}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full border-t border-brand-dark/5 my-8"></div>

                    {/* Content */}
                    <div className="space-y-8 text-lg text-brand-dark/80 leading-relaxed mb-12">
                        <div>
                            <h3 className="text-xl font-bold text-brand-dark mb-3">About the ideal candidate</h3>
                            <p className="whitespace-pre-wrap">{job.description}</p>
                        </div>

                        {job.deadline && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 font-medium rounded-xl border border-red-100 w-fit">
                                <Clock className="h-5 w-5" />
                                Deadline to apply: {new Date(job.deadline).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                    {missingResume && (
                        <div className="my-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-800">
                            <div className="flex flex-wrap items-center gap-3">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-sm font-semibold">Add a resume link to complete your profile.</span>
                            </div>
                            <Link href="/dashboard/settings?missing=resume">
                                <Button variant="outline" size="sm" className="bg-white text-yellow-900 border-yellow-300">
                                    Complete Profile
                                </Button>
                            </Link>
                        </div>
                    )}
                    {/* Apply Section */}
                    <div className="bg-brand-dark rounded-3xl p-8 text-white mt-12 flex flex-col md:flex-row shadow-2xl items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Ready to apply?</h3>
                            <p className="text-white/60">Your resume profile will be shared directly with the ReferralHub</p>

                        </div>
                        {hasApplied ? (
                            <Button disabled className="px-8 text-base font-bold rounded-xl bg-white/20 text-white cursor-not-allowed">
                                Already Applied
                            </Button>
                        ) : (
                            <ApplyButton jobId={job._id.toString()} />
                        )}
                    </div>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
