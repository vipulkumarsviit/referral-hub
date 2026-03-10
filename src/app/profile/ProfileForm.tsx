"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";

export default function ProfileForm() {
    const { data: session } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        }
        if (session) {
            fetchProfile();
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        const formData = new FormData(e.currentTarget);
        const raw = Object.fromEntries(formData.entries());
        const data: Record<string, any> = { ...raw };
        if (typeof data.resumeUrl === "string") data.resumeUrl = data.resumeUrl.trim();
        if (typeof data.linkedIn === "string") data.linkedIn = data.linkedIn.trim();
        if (typeof data.skills === "string") data.skills = (data.skills as string).trim();
        const prev = user;

        if (data.resumeUrl) {
            try {
                new URL(String(data.resumeUrl));
            } catch {
                setSaving(false);
                setMessage("Please enter a valid Resume URL");
                return;
            }
        }
        if (data.linkedIn) {
            try {
                new URL(String(data.linkedIn));
            } catch {
                setSaving(false);
                setMessage("Please enter a valid LinkedIn URL");
                return;
            }
        }
        try {
            console.log("Submitting profile payload", data);
        } catch {}

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const json = await res.json();
                setUser(json.user);
                const changed: string[] = [];
                const pick = (v: any) => (typeof v === "string" ? v.trim() : v);
                if (pick(prev?.name) !== pick(json.user?.name)) changed.push("name");
                if (pick(prev?.jobTitle) !== pick(json.user?.jobTitle)) changed.push("job title");
                if (pick(prev?.company) !== pick(json.user?.company)) changed.push("company");
                if ((prev?.skills || []).join(",") !== (json.user?.skills || []).join(",")) changed.push("skills");
                if (pick(prev?.preferredRole) !== pick(json.user?.preferredRole)) changed.push("preferred role");
                if (pick(prev?.preferredLocation) !== pick(json.user?.preferredLocation)) changed.push("location");
                if (pick(prev?.resumeUrl) !== pick(json.user?.resumeUrl)) changed.push("resume link");
                if (pick(prev?.linkedIn) !== pick(json.user?.linkedIn)) changed.push("LinkedIn");
                if (pick(prev?.bio) !== pick(json.user?.bio)) changed.push("bio");
                const suffix = changed.length ? ` Updated: ${changed.join(", ")}.` : "";
                setMessage(`Profile updated successfully.${suffix}`);
            } else {
                const text = await res.text().catch(() => "");
                setMessage(text || "Failed to update profile");
            }
        } catch (err) {
            setMessage("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!user) return <div className="p-12 text-center text-brand-dark/60">Profile not found.</div>;

    const isReferrer = user.role === "referrer";

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-brand-dark">Profile Settings</h1>
                <p className="mt-2 text-brand-dark/60">
                    Keep your personal info, experience, and preferences up to date.
                </p>
            </div>

            <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardContent className="p-6 md:p-8 space-y-10">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Personal Info */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-brand-dark">Personal Info</h2>
                                    <p className="text-sm text-brand-dark/60">
                                        Basic details used across your profile.
                                    </p>
                                </div>
                                {user.isVerified && isReferrer && (
                                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-success bg-success-light px-2 py-1 rounded-full">
                                        <CheckCircle className="h-3 w-3" />
                                        Verified Employee
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={user.name}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jobTitle">Current Title</Label>
                                    <Input
                                        id="jobTitle"
                                        name="jobTitle"
                                        defaultValue={user.jobTitle}
                                        required
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={user.email}
                                        disabled
                                        className="h-11 bg-brand-dark/5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="preferredLocation">Location</Label>
                                    <Input
                                        id="preferredLocation"
                                        name="preferredLocation"
                                        defaultValue={user.preferredLocation}
                                        className="h-11"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-brand-dark/5" />

                        {/* Experience */}
                        <section className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-brand-dark">Experience</h2>
                                <p className="text-sm text-brand-dark/60">
                                    Add your resume and professional links.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="resumeUrl">Resume</Label>
                                    <Input
                                        id="resumeUrl"
                                        name="resumeUrl"
                                        type="url"
                                        defaultValue={user.resumeUrl}
                                        placeholder="Link to your resume (Google Drive, PDF, etc.)"
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedIn">LinkedIn URL</Label>
                                    <Input
                                        id="linkedIn"
                                        name="linkedIn"
                                        type="url"
                                        defaultValue={user.linkedIn}
                                        placeholder="linkedin.com/in/your-profile"
                                        className="h-11"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-brand-dark/5" />

                        {/* Preferences */}
                        <section className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-brand-dark">Preferences</h2>
                                <p className="text-sm text-brand-dark/60">
                                    Skills and roles you’re interested in.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="skills">Skills</Label>
                                {user.skills?.length ? (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {user.skills.map((skill: string) => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                <Input
                                    id="skills"
                                    name="skills"
                                    defaultValue={user.skills?.join(", ")}
                                    placeholder="e.g. Product Design, React, Python"
                                    className="h-11"
                                />
                                <p className="text-xs text-brand-dark/50">
                                    Separate skills with commas.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="preferredRole">Preferred Roles</Label>
                                    <Input
                                        id="preferredRole"
                                        name="preferredRole"
                                        defaultValue={user.preferredRole}
                                        placeholder="e.g. Full-time, Senior"
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="preferredLocation">Preferred Locations</Label>
                                    <Input
                                        id="preferredLocation"
                                        name="preferredLocation"
                                        defaultValue={user.preferredLocation}
                                        placeholder="e.g. Remote, New York, London"
                                        className="h-11"
                                    />
                                </div>
                            </div>
                        </section>

                        {message && (
                            <div
                                className={`rounded-lg p-3 text-sm ${
                                    message.includes("success")
                                        ? "bg-success-light text-success"
                                        : "bg-red-50 text-red-500"
                                }`}
                            >
                                {message}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 px-6 text-sm font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-11 px-8 font-bold"
                                disabled={saving}
                            >
                                {saving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
