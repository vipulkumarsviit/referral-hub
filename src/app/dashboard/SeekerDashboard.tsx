"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SeekerDashboard({ userId }: { userId: string }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await fetch("/api/dashboard/seeker");
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

    function getStatusBadge(status: string) {
        switch (status) {
            case "Accepted":
                return <Badge className="bg-success-light text-success hover:bg-success-light border-none">Accepted</Badge>;
            case "Declined":
                return <Badge variant="destructive">Declined</Badge>;
            case "Viewed":
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Viewed</Badge>;
            default:
                return <Badge variant="outline" className="text-brand-dark/60 border-brand-dark/20">Applied</Badge>;
        }
    }

    return (
        <div>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark">
                        Your Applications
                    </h1>
                    <p className="mt-2 text-brand-dark/60">
                        Track the status of your referral requests.
                    </p>
                </div>
                <Link
                    href="/jobs"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                    <Search className="mr-2 h-4 w-4" /> Find Referrals
                </Link>
            </div>

            <div className="mb-10">
                {data.applications.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-brand-dark/20 p-12 text-center text-brand-dark/60">
                        You haven't requested any referrals yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {data.applications.map((app: any) => (
                            <Card key={app._id} className="border-brand-dark/10 shadow-sm transition-shadow hover:shadow-md">
                                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-bold text-brand-dark mb-2">
                                            {app.jobTitle}
                                        </CardTitle>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-brand-dark/60">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <Building2 className="h-4 w-4" />
                                                {app.company}
                                            </span>
                                            <span>Requested on {new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:items-end gap-2">
                                        {getStatusBadge(app.status)}
                                        {app.status === "Accepted" && (
                                            <Link href={`/messages/${app._id}`} className="text-sm font-bold text-primary hover:underline">
                                                Go to Messages
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
