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
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setMessage("Profile updated successfully");
            } else {
                setMessage("Failed to update profile");
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
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-brand-dark">Your Profile</h1>
                <p className="mt-2 text-brand-dark/60">
                    Manage your personal details and preferences.
                </p>
            </div>

            <Card className="border-brand-dark/10 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Personal Information</CardTitle>
                        {user.isVerified && isReferrer && (
                            <span className="flex items-center gap-1 text-xs font-bold text-success bg-success-light px-2 py-1 rounded-full">
                                <CheckCircle className="h-3 w-3" />
                                Verified Employee
                            </span>
                        )}
                    </div>
                    <CardDescription>Update your photo and personal details here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" defaultValue={user.name} required className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email <span className="text-xs text-brand-dark/40">(Cannot be changed)</span></Label>
                            <Input value={user.email} disabled className="h-11 bg-brand-dark/5" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input id="jobTitle" name="jobTitle" defaultValue={user.jobTitle} required className="h-11" />
                        </div>

                        {isReferrer && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input id="company" name="company" defaultValue={user.company} required className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Short Bio</Label>
                                    <Input id="bio" name="bio" defaultValue={user.bio} className="h-11" />
                                </div>
                            </>
                        )}

                        {!isReferrer && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="skills">Key Skills</Label>
                                    <Input id="skills" name="skills" defaultValue={user.skills?.join(", ")} className="h-11" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="preferredRole">Preferred Role</Label>
                                        <Input id="preferredRole" name="preferredRole" defaultValue={user.preferredRole} className="h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="preferredLocation">Location</Label>
                                        <Input id="preferredLocation" name="preferredLocation" defaultValue={user.preferredLocation} className="h-11" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="resumeUrl">Resume Link / URL</Label>
                                    <Input id="resumeUrl" name="resumeUrl" type="url" defaultValue={user.resumeUrl} className="h-11" />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                            <Input id="linkedIn" name="linkedIn" type="url" defaultValue={user.linkedIn} className="h-11" />
                        </div>

                        {message && (
                            <div className={`rounded-lg p-3 text-sm ${message.includes("success") ? "bg-success-light text-success" : "bg-red-50 text-red-500"}`}>
                                {message}
                            </div>
                        )}

                        <Button type="submit" className="w-full sm:w-auto h-11 font-bold mt-4" disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
