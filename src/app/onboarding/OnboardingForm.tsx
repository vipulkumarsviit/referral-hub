"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";

export default function OnboardingForm({ role }: { role: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isReferrer = role === "referrer";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/user/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || "Failed to save profile");
            }

            // Redirect to dashboard
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
            setLoading(false);
        }
    };

    return (
        <Card className="border-brand-dark/10 shadow-xl shadow-brand-dark/5">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Common fields (sort of) */}
                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Current Job Title</Label>
                        <Input id="jobTitle" name="jobTitle" required className="h-11" placeholder="e.g. Software Engineer" />
                    </div>

                    {isReferrer && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Input id="company" name="company" required className="h-11" placeholder="e.g. Acme Corp" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Short Bio (Optional)</Label>
                                <Input id="bio" name="bio" className="h-11" placeholder="A quick sentence about you" />
                            </div>
                        </>
                    )}

                    {!isReferrer && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="skills">Key Skills (comma separated)</Label>
                                <Input id="skills" name="skills" required className="h-11" placeholder="React, Node.js, Design" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="preferredRole">Preferred Role</Label>
                                    <Input id="preferredRole" name="preferredRole" required className="h-11" placeholder="e.g. Frontend Dev" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="preferredLocation">Location</Label>
                                    <Input id="preferredLocation" name="preferredLocation" required className="h-11" placeholder="City or Remote" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="resumeUrl">Resume Link / URL</Label>
                                <Input id="resumeUrl" name="resumeUrl" type="url" className="h-11" placeholder="Link to your resume (Drive, Dropbox, etc.)" />
                                <p className="text-xs text-brand-dark/40">For MVP, provide a link instead of uploading a PDF.</p>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="linkedIn">LinkedIn Profile (Optional)</Label>
                        <Input id="linkedIn" name="linkedIn" type="url" className="h-11" placeholder="https://linkedin.com/in/username" />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-11 font-bold mt-4" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Profile"}
                        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
