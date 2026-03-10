"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    CheckCircle,
    Building2,
    Clock,
    ArrowRight,
    Loader2,
} from "lucide-react";
import Link from "next/link";

export default function ReferrerDashboard({ userId }: { userId: string }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await fetch("/api/dashboard/referrer");
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!data) return <div className="py-12">Error loading dashboard</div>;

    const stats = [
        {
            label: "Total applicants",
            value: data.totalApplicants.toString(),
            icon: Users,
        },
        {
            label: "Referrals accepted",
            value: data.acceptedApplicants.toString(),
            icon: CheckCircle,
        },
    ];

    return (
        <div>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark">
                        Referrer Dashboard
                    </h1>
                    <p className="mt-2 text-brand-dark/60">
                        Manage your active listings and review applicants.
                    </p>
                </div>
                <Link
                    href="/dashboard/listings/new"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                    Post New Referral
                </Link>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-brand-dark/5 bg-white shadow-sm">
                        <CardContent className="flex items-center gap-6 p-6">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <stat.icon className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-brand-dark/60">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-extrabold text-brand-dark">
                                    {stat.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mb-10">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-brand-dark">
                        Active Listings ({data.listings.length}/3)
                    </h2>
                </div>

                {data.listings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-brand-dark/20 p-12 text-center text-brand-dark/60">
                        You have no active listings. Post one to start receiving applications!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {data.listings.map((listing: any) => (
                            <Link href={`/dashboard/listings/${listing._id}`} key={listing._id}>
                                <Card className="border-brand-dark/5 bg-white shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-bold text-brand-dark line-clamp-1">
                                            {listing.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-1.5 text-sm text-brand-dark/60">
                                            <Building2 className="h-3.5 w-3.5" />
                                            {listing.company}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Users className="h-4 w-4 text-brand-dark/40" />
                                                <span className="font-bold text-brand-dark">
                                                    {listing.applicantCount || 0}
                                                </span>
                                                <span className="text-brand-dark/60">Applicants</span>
                                            </div>
                                            {listing.deadline && (
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <Clock className="h-4 w-4 text-brand-dark/40" />
                                                    <span className="text-brand-dark/60">Ends {new Date(listing.deadline).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 text-sm font-bold text-primary flex items-center justify-end">
                                            Review <ArrowRight className="ml-1 h-3 w-3" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
