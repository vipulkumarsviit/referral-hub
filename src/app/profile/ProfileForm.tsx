"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";

type UserRole = "seeker" | "referrer" | "admin";

type ProfileUser = {
  _id?: string;
  name?: string;
  email?: string;
  role: UserRole;
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

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = (await res.json()) as { user: ProfileUser };
          setUser(data.user);
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

  const role = user?.role;
  const isSeeker = role === "seeker";
  const isReferrer = role === "referrer";
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
    };

    if (isReferrer) {
      payload.company = trimOrEmpty(formData.get("company"));
    }

    if (isSeeker) {
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

      const changed: string[] = [];
      const pick = (v: unknown) => (typeof v === "string" ? v.trim() : v);

      if (pick(prev.name) !== pick(json.user.name)) changed.push("name");
      if (pick(prev.jobTitle) !== pick(json.user.jobTitle)) changed.push("job title");
      if (pick(prev.bio) !== pick(json.user.bio)) changed.push("bio");

      if (isReferrer && pick(prev.company) !== pick(json.user.company)) {
        changed.push("company");
      }

      if (isSeeker) {
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
          Manage your profile details based on your account role.
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
                {user.isVerified && isReferrer && (
                  <span className="hidden items-center gap-1 rounded-full bg-success-light px-2 py-1 text-xs font-bold text-success sm:inline-flex">
                    <CheckCircle className="h-3 w-3" />
                    Verified Employee
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

            {(isSeeker || isReferrer || isAdmin) && <div className="h-px bg-brand-dark/5" />}

            {isReferrer && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-brand-dark">Company Profile</h2>
                  <p className="text-sm text-brand-dark/60">Share your workplace and short intro.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              </section>
            )}

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

            {isSeeker && (
              <>
                <section className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-brand-dark">Experience</h2>
                    <p className="text-sm text-brand-dark/60">Add your resume and LinkedIn profile.</p>
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
                </section>

                <div className="h-px bg-brand-dark/5" />

                <section className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-brand-dark">Preferences</h2>
                    <p className="text-sm text-brand-dark/60">Skills and roles you’re interested in.</p>
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
              </>
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
              <Button type="submit" className="h-11 px-8 font-bold" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
