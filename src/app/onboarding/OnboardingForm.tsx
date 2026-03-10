"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function OnboardingForm({ role }: { role: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "",
        jobTitle: "",
        resumeUrl: "",
        linkedIn: "",
        skills: "",
        preferredRole: "",
        preferredLocation: "",
    });

    const isReferrer = role === "referrer";
    const isSeeker = role === "seeker";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            if (isSeeker) {
                const payload = {
                    jobTitle: data.jobTitle || form.jobTitle,
                    resumeUrl: data.resumeUrl || form.resumeUrl,
                    linkedIn: data.linkedIn || form.linkedIn,
                    skills: (data.skills || form.skills) as string,
                    preferredRole: data.preferredRole || form.preferredRole,
                    preferredLocation: data.preferredLocation || form.preferredLocation,
                };

                if (data.name || form.name) {
                    await fetch("/api/user/profile", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: data.name || form.name, jobTitle: payload.jobTitle }),
                    });
                }

                const res = await fetch("/api/user/onboarding", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const result = await res.json();
                    throw new Error(result.message || "Failed to save profile");
                }

                router.push("/dashboard");
                router.refresh();
                return;
            }

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
                {/* Seeker: 3-step flow resembling Stitch designs */}
                {isSeeker ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-brand-dark/60">STEP {step} OF 3</div>
                            <div className="text-xs text-brand-dark/40">{Math.round((step / 3) * 100)}% complete</div>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-dark/10">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(step / 3) * 100}%` }} />
                        </div>

                        <div className="rounded-2xl border border-brand-dark/10 bg-brand-dark/5 p-3">
                            {step === 1 && (
                                <Image
                                    src="/stitch/5265646510576057629/50538d5f52e14751a790a69eec52cb19/screenshot.png"
                                    alt="Profile Builder Step 1"
                                    width={960}
                                    height={768}
                                    className="w-full h-auto rounded-xl"
                                />
                            )}
                            {step === 2 && (
                                <Image
                                    src="/stitch/5265646510576057629/ab779b2d12414be89c2c15b11ed11bb2/screenshot.png"
                                    alt="Profile Builder Step 2"
                                    width={960}
                                    height={768}
                                    className="w-full h-auto rounded-xl"
                                />
                            )}
                            {step === 3 && (
                                <Image
                                    src="/stitch/5265646510576057629/512358307ddc4765af1784ca9dd0c5ae/screenshot.png"
                                    alt="Profile Builder Step 3"
                                    width={960}
                                    height={768}
                                    className="w-full h-auto rounded-xl"
                                />
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {step === 1 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            className="h-11"
                                            placeholder="Jane Cooper"
                                            value={form.name}
                                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">Current Job Title</Label>
                                        <Input
                                            id="jobTitle"
                                            name="jobTitle"
                                            required
                                            className="h-11"
                                            placeholder="Senior Product Designer"
                                            value={form.jobTitle}
                                            onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                                        />
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="resumeUrl">Resume (PDF) — URL</Label>
                                        <Input
                                            id="resumeUrl"
                                            name="resumeUrl"
                                            type="url"
                                            className="h-11"
                                            placeholder="https://your-site.com/resume.pdf"
                                            value={form.resumeUrl}
                                            onChange={(e) => setForm((f) => ({ ...f, resumeUrl: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedIn">LinkedIn Profile URL</Label>
                                        <Input
                                            id="linkedIn"
                                            name="linkedIn"
                                            type="url"
                                            className="h-11"
                                            placeholder="https://linkedin.com/in/username"
                                            value={form.linkedIn}
                                            onChange={(e) => setForm((f) => ({ ...f, linkedIn: e.target.value }))}
                                        />
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="skills">Skills</Label>
                                        <Input
                                            id="skills"
                                            name="skills"
                                            className="h-11"
                                            placeholder="Product Design, React, Python"
                                            value={form.skills}
                                            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="preferredRole">Preferred Role</Label>
                                            <Input
                                                id="preferredRole"
                                                name="preferredRole"
                                                className="h-11"
                                                placeholder="Senior Product Designer"
                                                value={form.preferredRole}
                                                onChange={(e) => setForm((f) => ({ ...f, preferredRole: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="preferredLocation">Preferred Location</Label>
                                            <Input
                                                id="preferredLocation"
                                                name="preferredLocation"
                                                className="h-11"
                                                placeholder="Remote, London, New York"
                                                value={form.preferredLocation}
                                                onChange={(e) =>
                                                    setForm((f) => ({ ...f, preferredLocation: e.target.value }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {error && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>
                            )}

                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11"
                                    disabled={loading || step === 1}
                                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                                >
                                    Back
                                </Button>
                                {step < 3 ? (
                                    <Button
                                        type="button"
                                        className="h-11 px-6 font-bold"
                                        disabled={loading || (step === 1 && (!form.name || !form.jobTitle))}
                                        onClick={() => setStep((s) => Math.min(3, s + 1))}
                                    >
                                        Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" className="h-11 px-6 font-bold" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Profile"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                ) : (
                    // Referrer single-step
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input id="jobTitle" name="jobTitle" required className="h-11" placeholder="e.g. Senior Engineer" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input id="company" name="company" required className="h-11" placeholder="e.g. Acme Corp" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                            <Input id="linkedIn" name="linkedIn" type="url" className="h-11" placeholder="https://linkedin.com/in/username" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Short Bio (Optional)</Label>
                            <Input id="bio" name="bio" className="h-11" placeholder="A quick sentence about you" />
                        </div>

                        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}

                        <Button type="submit" className="w-full h-11 font-bold mt-2" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Profile"}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
