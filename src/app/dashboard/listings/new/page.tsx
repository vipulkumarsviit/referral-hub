"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NewListingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || "Failed to create listing");
            }

            // Redirect back to dashboard
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
            setLoading(false);
        }
    };

    if ((session?.user as any)?.role !== "referrer") {
        return <div className="p-12 text-center text-brand-dark/60">Only referrers can access this page.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 lg:py-12">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-brand-dark/60 hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-brand-dark">Post a Referral</h1>
                <p className="mt-2 text-brand-dark/60">
                    Create a new referral opportunity. It will be associated with your verified company.
                </p>
            </div>

            <Card className="border-brand-dark/10 shadow-sm">
                <CardHeader>
                    <CardTitle>Listing Details</CardTitle>
                    <CardDescription>Job seekers will use this to find the role.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">Job Title / Role</Label>
                            <Input id="title" name="title" required className="h-11" placeholder="e.g. Senior Product Designer" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="location">Job Location</Label>
                                <Input id="location" name="location" required className="h-11" placeholder="e.g. New York, NY or Remote" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roleType">Role Type</Label>
                                <select id="roleType" name="roleType" required className="flex h-11 w-full rounded-md border border-border bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experienceLevel">Required Experience Level</Label>
                            <select id="experienceLevel" name="experienceLevel" required className="flex h-11 w-full rounded-md border border-border bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="Entry">Entry (0-2 years)</option>
                                <option value="Mid">Mid (3-5 years)</option>
                                <option value="Senior">Senior (5+ years)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">What you're looking for (300 chars max)</Label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                maxLength={300}
                                className="flex min-h-[100px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe the ideal candidate and the specific team or project..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deadline">Application Deadline (Optional)</Label>
                            <Input id="deadline" name="deadline" type="date" className="h-11" />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 font-bold mt-4" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Post Listing"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
