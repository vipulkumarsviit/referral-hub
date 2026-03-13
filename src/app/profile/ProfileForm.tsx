"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

type UserRole = "user" | "admin";

type ProfileUser = {
  _id?: string;
  name?: string;
  email?: string;
  role: UserRole;
  workEmail?: string;
  workEmailVerified?: boolean;
  jobTitle?: string;
  company?: string;
  bio?: string;
  linkedIn?: string;
  resumeUrl?: string;
  skills?: string[];
  preferredRole?: string;
  preferredLocation?: string;
  isVerified?: boolean;
};

function trimOrEmpty(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidUrl(value: string) {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export default function ProfileForm() {
  const { data: session } = useSession();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [workEmailInput, setWorkEmailInput] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = (await res.json()) as { user: ProfileUser };
          setUser(data.user);
          setWorkEmailInput(data.user.workEmail || "");
        }
      } catch {
        setMessage("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchProfile();
    }
  }, [session]);

  useEffect(() => {
    const status = searchParams.get("status");
    const verify = searchParams.get("verify");
    if (verify === "work-email" && status) {
      if (status === "success") {
        setVerificationStatus("Work email verified successfully.");
      } else if (status === "invalid") {
        setVerificationStatus("Verification link is invalid or expired.");
      } else if (status === "error") {
        setVerificationStatus("We couldn't verify your work email. Please try again.");
      }
    }
  }, [searchParams]);

  const role = user?.role;
  const isAdmin = role === "admin";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const prev = user;

    const payload: Record<string, unknown> = {
      name: trimOrEmpty(formData.get("name")),
      jobTitle: trimOrEmpty(formData.get("jobTitle")),
      bio: trimOrEmpty(formData.get("bio")),
      company: trimOrEmpty(formData.get("company")),
      workEmail: trimOrEmpty(formData.get("workEmail")),
    };

    if (!isAdmin) {
      const resumeUrl = trimOrEmpty(formData.get("resumeUrl"));
      const linkedIn = trimOrEmpty(formData.get("linkedIn"));

      if (!isValidUrl(resumeUrl)) {
        setSaving(false);
        setMessage("Please enter a valid Resume URL");
        return;
      }

      if (!isValidUrl(linkedIn)) {
        setSaving(false);
        setMessage("Please enter a valid LinkedIn URL");
        return;
      }

      payload.resumeUrl = resumeUrl;
      payload.linkedIn = linkedIn;
      payload.skills = trimOrEmpty(formData.get("skills"));
      payload.preferredRole = trimOrEmpty(formData.get("preferredRole"));
      payload.preferredLocation = trimOrEmpty(formData.get("preferredLocation"));
    }

    if (isAdmin) {
      // Admin settings stay minimal by design.
      delete payload.company;
      delete payload.workEmail;
      delete payload.resumeUrl;
      delete payload.linkedIn;
      delete payload.skills;
      delete payload.preferredRole;
      delete payload.preferredLocation;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setMessage(text || "Failed to update profile");
        setSaving(false);
        return;
      }

      const json = (await res.json()) as { user: ProfileUser };
      setUser(json.user);
      setWorkEmailInput(json.user.workEmail || "");

      const changed: string[] = [];
      const pick = (v: unknown) => (typeof v === "string" ? v.trim() : v);

      if (pick(prev.name) !== pick(json.user.name)) changed.push("name");
      if (pick(prev.jobTitle) !== pick(json.user.jobTitle)) changed.push("job title");
      if (pick(prev.bio) !== pick(json.user.bio)) changed.push("bio");

      if (!isAdmin && pick(prev.company) !== pick(json.user.company)) {
        changed.push("company");
      }

      if (!isAdmin) {
        if (pick(prev.resumeUrl) !== pick(json.user.resumeUrl)) changed.push("resume link");
        if (pick(prev.linkedIn) !== pick(json.user.linkedIn)) changed.push("LinkedIn");
        if ((prev.skills || []).join(",") !== (json.user.skills || []).join(",")) changed.push("skills");
        if (pick(prev.preferredRole) !== pick(json.user.preferredRole)) changed.push("preferred role");
        if (pick(prev.preferredLocation) !== pick(json.user.preferredLocation)) changed.push("preferred location");
      }

      const suffix = changed.length ? ` Updated: ${changed.join(", ")}.` : "";
      setMessage(`Profile updated successfully.${suffix}`);
    } catch {
      setMessage("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const workEmailBadge = user?.workEmailVerified ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-1 text-xs font-bold text-success">
      <CheckCircle className="h-3 w-3" />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-dark/5 px-2 py-1 text-xs font-bold text-brand-dark/60">
      Not verified
    </span>
  );

  const handleVerify = async () => {
    setVerifying(true);
    setVerificationStatus("");
    try {
      const res = await fetch("/api/user/work-email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workEmail: workEmailInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to send verification email.");
      }
      setVerificationStatus("Verification email sent. Check your inbox.");
    } catch (err: any) {
      setVerificationStatus(err.message || "Unable to send verification email.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <div className="py-12 text-center text-brand-dark/60">Profile not found.</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-dark">Profile Settings</h1>
        <p className="mt-2 text-brand-dark/60">
          Manage your profile details and work email verification.
        </p>
      </div>

      <Card className="rounded-3xl border-none bg-white shadow-sm">
        <CardContent className="space-y-10 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-brand-dark">Personal Info</h2>
                  <p className="text-sm text-brand-dark/60">Basic details used across your account.</p>
                </div>
                {user.isVerified && (
                  <span className="hidden items-center gap-1 rounded-full bg-success-light px-2 py-1 text-xs font-bold text-success sm:inline-flex">
                    <CheckCircle className="h-3 w-3" />
                    Email verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" defaultValue={user.name} required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Current Title</Label>
                  <Input id="jobTitle" name="jobTitle" defaultValue={user.jobTitle} required className="h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled className="h-11 bg-brand-dark/5" />
              </div>
            </section>

            {!isAdmin && <div className="h-px bg-brand-dark/5" />}

            {isAdmin && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-dark">Admin Profile</h2>
                  <p className="text-sm text-brand-dark/60">
                    Admin profile is intentionally minimal and excludes resume/LinkedIn/company fields.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Short Bio</Label>
                  <Input
                    id="bio"
                    name="bio"
                    defaultValue={user.bio}
                    placeholder="Optional admin bio"
                    className="h-11"
                  />
                </div>
              </section>
            )}

            {!isAdmin && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <section className="space-y-6 rounded-2xl border border-brand-dark/5 bg-brand-bg/40 p-6">
                  <div>
                    <h2 className="text-lg font-semibold text-brand-dark">Referrer Profile</h2>
                    <p className="text-sm text-brand-dark/60">Company details and verification.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        defaultValue={user.company}
                        placeholder="e.g. Acme Inc"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Short Bio</Label>
                      <Input
                        id="bio"
                        name="bio"
                        defaultValue={user.bio}
                        placeholder="A short intro"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Label htmlFor="workEmail">Work Email</Label>
                      {workEmailBadge}
                    </div>
                    <Input
                      id="workEmail"
                      name="workEmail"
                      type="email"
                      value={workEmailInput}
                      onChange={(e) => setWorkEmailInput(e.target.value)}
                      className="h-11"
                      placeholder="name@company.com"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleVerify}
                        disabled={verifying || !workEmailInput || user?.workEmailVerified}
                      >
                        {verifying ? "Sending..." : "Verify work email"}
                      </Button>
                      {verificationStatus && (
                        <span className="text-xs text-brand-dark/60">{verificationStatus}</span>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-6 rounded-2xl border border-brand-dark/5 bg-white p-6">
                  <div>
                    <h2 className="text-lg font-semibold text-brand-dark">Seeker Profile</h2>
                    <p className="text-sm text-brand-dark/60">Resume, skills, and preferences.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resumeUrl">Resume URL</Label>
                      <Input
                        id="resumeUrl"
                        name="resumeUrl"
                        type="url"
                        defaultValue={user.resumeUrl}
                        placeholder="https://example.com/resume.pdf"
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
                        placeholder="https://linkedin.com/in/username"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="skills">Skills</Label>
                    {user.skills?.length ? (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {user.skills.map((skill) => (
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
                      placeholder="e.g. React, TypeScript, Product Design"
                      className="h-11"
                    />
                    <p className="text-xs text-brand-dark/50">Separate skills with commas.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="preferredRole">Preferred Role</Label>
                      <Input
                        id="preferredRole"
                        name="preferredRole"
                        defaultValue={user.preferredRole}
                        placeholder="e.g. Product Engineer"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredLocation">Preferred Location</Label>
                      <Input
                        id="preferredLocation"
                        name="preferredLocation"
                        defaultValue={user.preferredLocation}
                        placeholder="e.g. Remote, Bengaluru"
                        className="h-11"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

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

            <div className="flex items-center justify-end pt-2">
              <Button type="submit" className="px-8 font-bold" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
