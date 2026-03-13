"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Briefcase, Clock, AlertCircle, ShieldCheck, Loader2, Sparkles, Share2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type JobDetailResponse = {
    job: {
        _id: string;
        company: string;
        title: string;
        location: string;
        roleType: string;
        experienceLevel: string;
        description: string;
        deadline?: string;
    };
    referrer?: { name?: string; jobTitle?: string; company?: string; isVerified?: boolean; image?: string };
    referrerStats?: { received: number; accepted: number };
    listingStats?: { received: number; accepted: number };
    missingResume?: boolean;
    hasApplied?: boolean;
};

export default function JobDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session } = useSession();
    const [data, setData] = useState<JobDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyMessage, setApplyMessage] = useState("");
    const [applyError, setApplyError] = useState("");
    const [needsProfile, setNeedsProfile] = useState(false);

    const jobId = useMemo(() => params?.id ?? "", [params]);

    useEffect(() => {
        let ignore = false;
        async function fetchJob() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
                if (res.status === 404) {
                    if (!ignore) {
                        setData(null);
                        setError("Job not found.");
                    }
                    return;
                }
                if (!res.ok) {
                    throw new Error("Failed to load job details");
                }
                const json = (await res.json()) as JobDetailResponse;
                if (!ignore) {
                    setData(json);
                }
            } catch (err: any) {
                if (!ignore) {
                    setError(err.message || "Failed to load job details");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        if (jobId) {
            fetchJob();
        }

        return () => {
            ignore = true;
        };
    }, [jobId]);

    const handleApply = async () => {
        if (!session) {
            router.push("/login");
            return;
        }
        if (!data?.job?._id) return;

        setApplyLoading(true);
        setApplyError("");
        setApplyMessage("");
        setNeedsProfile(false);

        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId: data.job._id }),
            });

            const result = await res.json();
            if (!res.ok) {
                const msg = result.message || "Failed to apply";
                if (res.status === 400 && typeof msg === "string" && msg.toLowerCase().includes("resume link")) {
                    setNeedsProfile(true);
                }
                throw new Error(msg);
            }

            setApplyMessage("Application sent successfully!");
            setData((prev) => (prev ? { ...prev, hasApplied: true } : prev));
        } catch (err: any) {
            setApplyError(err.message || "Failed to apply");
        } finally {
            setApplyLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <SiteHeader />
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <SiteFooter />
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="min-h-screen bg-background">
                <SiteHeader />
                <main className="mx-auto max-w-3xl px-6 py-16 text-center">
                    <h1 className="text-2xl font-bold text-brand-dark">We couldn’t find that job</h1>
                    <p className="mt-3 text-brand-dark/60">{error}</p>
                    <Link href="/jobs" className="mt-6 inline-flex text-primary font-bold hover:underline">
                        Back to browse
                    </Link>
                </main>
                <SiteFooter />
            </div>
        );
    }

    if (!data) return null;

    const { job, referrer, referrerStats, listingStats, missingResume, hasApplied } = data;

    const requirements = [
        `${job.experienceLevel} level experience`,
        `${job.roleType} role`,
        `Location: ${job.location}`,
    ];

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
                {applyError && (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                <AlertCircle className="h-4 w-4" />
                            </span>
                            <div>
                                <p className="font-semibold">We couldn’t submit your request</p>
                                <p className="mt-1 text-xs text-amber-700">{applyError}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-6 text-sm text-brand-dark/60">
                    <Link href="/jobs" className="text-primary font-semibold hover:underline">
                        Browse Referrals
                    </Link>
                    <span className="px-2">›</span>
                    <span>{job.title} at {job.company}</span>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.6fr]">
                    <div className="space-y-8">
                        <div className="rounded-3xl border border-brand-dark/5 bg-white p-8 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-dark text-white">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-extrabold text-brand-dark">{job.title}</h1>
                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-brand-dark/60">
                                            <span>{job.company}</span>
                                            <span>•</span>
                                            <span>{job.location}</span>
                                            <span>•</span>
                                            <span>{job.roleType}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button variant="outline" className="font-semibold">
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                    </Button>
                                    {hasApplied ? (
                                        <Button disabled className="px-6 font-bold rounded-xl bg-brand-dark text-white/70">
                                            Applied
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleApply}
                                            disabled={applyLoading}
                                            className="px-6 font-bold rounded-xl bg-primary text-white hover:bg-primary/90"
                                        >
                                            {applyLoading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            Request Referral
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                    {job.experienceLevel} Level
                                </Badge>
                                <Badge variant="secondary" className="bg-brand-dark/5 text-brand-dark border-none">
                                    <ShieldCheck className="mr-1 h-3.5 w-3.5 text-primary" />
                                    Verified referral
                                </Badge>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-brand-dark/5 bg-white p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 text-brand-dark">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold">Current Listing Stats</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-brand-dark/60">
                                <div className="rounded-2xl border border-brand-dark/5 bg-brand-bg/40 px-4 py-4">
                                    <p className="text-xs uppercase tracking-wide text-brand-dark/40">Received</p>
                                    <p className="mt-2 text-2xl font-bold text-brand-dark">{listingStats?.received ?? 0}</p>
                                </div>
                                <div className="rounded-2xl border border-brand-dark/5 bg-brand-bg/40 px-4 py-4">
                                    <p className="text-xs uppercase tracking-wide text-brand-dark/40">Accepted</p>
                                    <p className="mt-2 text-2xl font-bold text-brand-dark">{listingStats?.accepted ?? 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-brand-dark/5 bg-white p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 text-brand-dark">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold">Job Description</h2>
                            </div>
                            <p className="text-base leading-relaxed text-brand-dark/70 whitespace-pre-wrap">
                                {job.description}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-brand-dark/5 bg-white p-8 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 text-brand-dark">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold">What we’re looking for</h2>
                            </div>
                            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-brand-dark/70">
                                We’re looking for candidates who are excited about this role and ready to grow with the team.
                            </div>
                            <ul className="space-y-3 text-sm text-brand-dark/70">
                                {requirements.map((req) => (
                                    <li key={req} className="flex items-start gap-2">
                                        <span className="mt-1 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                            <CheckCircle className="h-3.5 w-3.5" />
                                        </span>
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {job.deadline && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                        <Clock className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Deadline</p>
                                        <p className="text-sm font-semibold text-amber-800">
                                            Apply by {new Date(job.deadline).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-3xl border border-brand-dark/10 bg-white p-6 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-brand-dark/40">
                                Referrer details
                            </p>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark/5 text-brand-dark font-bold">
                                    {referrer?.name ? referrer.name.split(" ").map((p) => p[0]).slice(0, 2).join("") : "RH"}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-brand-dark">{referrer?.name || "ReferralHub Member"}</p>
                                    <p className="text-xs text-brand-dark/60">
                                        {(referrer?.jobTitle || "Referrer")} {referrer?.company ? `@ ${referrer.company}` : ""}
                                    </p>
                                    {referrer?.isVerified && (
                                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-success">
                                            <ShieldCheck className="h-3 w-3" />
                                            Verified referrer
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 border-t border-brand-dark/5 pt-4">
                                <div className="flex items-center justify-between text-sm text-brand-dark/60">
                                    <span>Referrals received</span>
                                    <span className="font-semibold text-brand-dark">{referrerStats?.received ?? 0}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-sm text-brand-dark/60">
                                    <span>Referrals accepted</span>
                                    <span className="font-semibold text-brand-dark">{referrerStats?.accepted ?? 0}</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                {applyMessage || needsProfile ? (
                                    <div
                                        className={`rounded-2xl border px-4 py-4 text-sm ${applyMessage
                                            ? "border-success-light bg-success-light text-success"
                                            : "border-brand-dark/10 bg-brand-bg/60 text-brand-dark"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${applyMessage
                                                    ? "bg-white/70 text-success"
                                                    : "bg-primary/10 text-primary"
                                                    }`}
                                            >
                                                {applyMessage ? <Sparkles className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                            </span>
                                            <div>
                                                <p className="font-semibold">
                                                    {applyMessage ? "Application sent" : "Complete your profile"}
                                                </p>
                                                <p className="mt-1 text-xs">
                                                    {applyMessage ? applyMessage : "Add a resume link to request a referral."}
                                                </p>
                                            </div>
                                        </div>
                                        {needsProfile && (
                                            <Link href="/dashboard/settings?missing=resume" className="mt-3 inline-flex text-primary font-semibold hover:underline">
                                                Verify profile →
                                            </Link>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                            <div className="mt-6">
                                {hasApplied ? (
                                    <Button disabled className="w-full rounded-xl bg-brand-dark text-white/70">
                                        Already Applied
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleApply}
                                        disabled={applyLoading}
                                        className="w-full rounded-xl bg-primary text-white hover:bg-primary/90"
                                    >
                                        {applyLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Request Referral
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-brand-dark/10 bg-brand-bg/60 p-6 text-sm text-brand-dark/70">
                            <div className="flex items-center gap-3 text-brand-dark">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <p className="font-semibold">Success tip</p>
                            </div>
                            <p className="mt-3">
                                Write a concise summary of why you’re a strong fit for this role and mention a recent project you loved.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
