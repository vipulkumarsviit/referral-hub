"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import { CheckCircle, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function OnboardingForm({ role }: { role: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const totalSteps = role === "referrer" ? 2 : 5;
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "",
        jobTitle: "",
        resumeUrl: "",
        linkedIn: "",
        skills: "",
        preferredRole: "",
        preferredLocation: "",
        company: "",
        bio: "",
    });
    const [emailVerified, setEmailVerified] = useState(false);
    const [verifyStatus, setVerifyStatus] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [savingStep, setSavingStep] = useState(false);
    const searchParams = useSearchParams();

    const isReferrer = role === "referrer";
    const isSeeker = role === "seeker";

    useEffect(() => {
        let ignore = false;
        async function fetchProfile() {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    if (!ignore) {
                        setEmailVerified(Boolean(data.user?.isVerified));
                        setForm((prev) => ({
                            ...prev,
                            name: data.user?.name || prev.name,
                            jobTitle: data.user?.jobTitle || prev.jobTitle,
                            resumeUrl: data.user?.resumeUrl || prev.resumeUrl,
                            linkedIn: data.user?.linkedIn || prev.linkedIn,
                            skills: Array.isArray(data.user?.skills)
                                ? data.user.skills.join(", ")
                                : data.user?.skills || prev.skills,
                            preferredRole: data.user?.preferredRole || prev.preferredRole,
                            preferredLocation: data.user?.preferredLocation || prev.preferredLocation,
                            company: data.user?.company || prev.company,
                            bio: data.user?.bio || prev.bio,
                        }));
                    }
                }
            } catch {
                // ignore
            }
        }

        fetchProfile();

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        const status = searchParams.get("status");
        const verify = searchParams.get("verify");
        const stepParam = Number(searchParams.get("step"));
        if (verify === "email" && status) {
            if (status === "success") {
                setVerifyStatus("Email verified successfully.");
                setEmailVerified(true);
            } else if (status === "invalid") {
                setVerifyStatus("Verification link is invalid or expired.");
            } else if (status === "error") {
                setVerifyStatus("We couldn't verify your email. Please try again.");
            }
        }
        if (stepParam && Number.isFinite(stepParam)) {
            setStep(Math.min(totalSteps, Math.max(1, stepParam)));
        }
    }, [searchParams, totalSteps]);

    const saveSeekerStep = async (currentStep: number) => {
        if (!isSeeker) return;
        setSavingStep(true);
        setError("");

        try {
            if (currentStep === 1) {
                if (form.name || form.jobTitle) {
                    await fetch("/api/user/profile", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: form.name, jobTitle: form.jobTitle }),
                    });
                }
                return;
            }

            if (currentStep === 2) {
                await fetch("/api/user/onboarding", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        resumeUrl: form.resumeUrl,
                        linkedIn: form.linkedIn,
                    }),
                });
                return;
            }

            if (currentStep === 3) {
                await fetch("/api/user/onboarding", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        skills: form.skills,
                        preferredRole: form.preferredRole,
                        preferredLocation: form.preferredLocation,
                    }),
                });
                return;
            }
        } catch (err: any) {
            setError(err.message || "Unable to save progress.");
        } finally {
            setSavingStep(false);
        }
    };

    const saveReferrerStep = async () => {
        if (!isReferrer) return;
        setSavingStep(true);
        setError("");

        try {
            const res = await fetch("/api/user/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company: form.company,
                    jobTitle: form.jobTitle,
                    linkedIn: form.linkedIn,
                    bio: form.bio,
                }),
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || "Failed to save profile");
            }
        } catch (err: any) {
            setError(err.message || "Unable to save progress.");
        } finally {
            setSavingStep(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSeeker && step < totalSteps) {
            await saveSeekerStep(step);
            setStep((s) => Math.min(totalSteps, s + 1));
            return;
        }
        if (isReferrer && step < totalSteps) {
            await saveReferrerStep();
            setStep((s) => Math.min(totalSteps, s + 1));
            return;
        }
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

                setCompleted(true);
                return;
            }

            if (isReferrer && step === totalSteps) {
                setCompleted(true);
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
            setCompleted(true);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
            setLoading(false);
        }
    };

    return (
        <Card className="border-brand-dark/10 shadow-xl shadow-brand-dark/5">
            <CardContent className="pt-6">
                {/* Seeker: multi-step flow resembling Stitch designs */}
                {completed ? (
                    <div className="space-y-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-brand-dark">Profile completed</h2>
                            <p className="mt-2 text-sm text-brand-dark/60">
                                Where would you like to go next?
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Button
                                type="button"
                                className="font-bold"
                                onClick={() => {
                                    router.push("/jobs");
                                    router.refresh();
                                }}
                            >
                                Browse referrals
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="font-bold"
                                onClick={() => {
                                    router.push("/dashboard");
                                    router.refresh();
                                }}
                            >
                                Go to dashboard
                            </Button>
                        </div>
                    </div>
                ) : isSeeker ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-brand-dark/60">STEP {step} OF {totalSteps}</div>
                            <div className="text-xs text-brand-dark/40">{Math.round((step / totalSteps) * 100)}% complete</div>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-dark/10">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
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

                            {step === 4 && (
                                <>
                                    {!emailVerified ? (
                                        <div className="rounded-xl border border-brand-dark/10 bg-brand-bg/60 p-4">
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Mail className="h-5 w-5" />
                                                </span>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-brand-dark">
                                                        Verify your email
                                                    </p>
                                                    <p className="text-xs text-brand-dark/60">
                                                        Social logins are verified automatically. For email logins, please verify to secure your account.
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={async () => {
                                                            setVerifying(true);
                                                            setVerifyStatus("");
                                                            try {
                                                                const res = await fetch("/api/user/email/verify", { method: "POST" });
                                                                const data = await res.json();
                                                                if (!res.ok) {
                                                                    throw new Error(data.message || "Unable to send verification email.");
                                                                }
                                                                setVerifyStatus("Verification email sent. Check your inbox.");
                                                            } catch (err: any) {
                                                                setVerifyStatus(err.message || "Unable to send verification email.");
                                                            } finally {
                                                                setVerifying(false);
                                                            }
                                                        }}
                                                        disabled={verifying}
                                                    >
                                                        {verifying ? "Sending..." : "Send verification email"}
                                                    </Button>
                                                </div>
                                            </div>
                                            {verifyStatus && (
                                                <div className="mt-3 text-xs text-brand-dark/60">{verifyStatus}</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-success">
                                            <CheckCircle className="h-4 w-4" />
                                            Email verified
                                        </div>
                                    )}
                                </>
                            )}

                            {error && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>
                            )}

                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loading || step === 1}
                                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                                >
                                    Back
                                </Button>
                                {step < totalSteps ? (
                                    <Button
                                        type="button"
                                        className="px-6 font-bold"
                                        disabled={loading || savingStep || (step === 1 && (!form.name || !form.jobTitle))}
                                        onClick={async () => {
                                            await saveSeekerStep(step);
                                            setStep((s) => Math.min(totalSteps, s + 1));
                                        }}
                                    >
                                        {savingStep ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                Next <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button type="submit" className="px-6 font-bold" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Profile"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                ) : (
                    // Referrer two-step flow
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-brand-dark/60">STEP {step} OF {totalSteps}</div>
                            <div className="text-xs text-brand-dark/40">{Math.round((step / totalSteps) * 100)}% complete</div>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-dark/10">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {step === 1 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">Job Title</Label>
                                        <Input
                                            id="jobTitle"
                                            name="jobTitle"
                                            required
                                            className="h-11"
                                            placeholder="e.g. Senior Engineer"
                                            value={form.jobTitle}
                                            onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company</Label>
                                        <Input
                                            id="company"
                                            name="company"
                                            required
                                            className="h-11"
                                            placeholder="e.g. Acme Corp"
                                            value={form.company}
                                            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedIn">LinkedIn Profile</Label>
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
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Short Bio (Optional)</Label>
                                        <Input
                                            id="bio"
                                            name="bio"
                                            className="h-11"
                                            placeholder="A quick sentence about you"
                                            value={form.bio}
                                            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                                        />
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    {!emailVerified ? (
                                        <div className="rounded-xl border border-brand-dark/10 bg-brand-bg/60 p-4">
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Mail className="h-5 w-5" />
                                                </span>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-brand-dark">Verify your email</p>
                                                    <p className="text-xs text-brand-dark/60">
                                                        Social logins are verified automatically. For email logins, please verify to secure your account.
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={async () => {
                                                            setVerifying(true);
                                                            setVerifyStatus("");
                                                            try {
                                                                const res = await fetch("/api/user/email/verify", { method: "POST" });
                                                                const data = await res.json();
                                                                if (!res.ok) {
                                                                    throw new Error(data.message || "Unable to send verification email.");
                                                                }
                                                                setVerifyStatus("Verification email sent. Check your inbox.");
                                                            } catch (err: any) {
                                                                setVerifyStatus(err.message || "Unable to send verification email.");
                                                            } finally {
                                                                setVerifying(false);
                                                            }
                                                        }}
                                                        disabled={verifying}
                                                    >
                                                        {verifying ? "Sending..." : "Send verification email"}
                                                    </Button>
                                                </div>
                                            </div>
                                            {verifyStatus && (
                                                <div className="mt-3 text-xs text-brand-dark/60">{verifyStatus}</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-success">
                                            <CheckCircle className="h-4 w-4" />
                                            Email verified
                                        </div>
                                    )}
                                </>
                            )}

                            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}

                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loading || savingStep || step === 1}
                                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                                >
                                    Back
                                </Button>
                                {step < totalSteps ? (
                                    <Button
                                        type="button"
                                        className="px-6 font-bold"
                                        disabled={loading || savingStep || (!form.jobTitle || !form.company)}
                                        onClick={async () => {
                                            await saveReferrerStep();
                                            setStep((s) => Math.min(totalSteps, s + 1));
                                        }}
                                    >
                                        {savingStep ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                Next <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button type="submit" className="px-6 font-bold" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Profile"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
