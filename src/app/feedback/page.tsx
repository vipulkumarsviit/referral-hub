"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Bug, Lightbulb, ShieldCheck, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

export default function FeedbackPage() {
  const [type, setType] = useState<"issue" | "feature">("issue");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { data: session } = useSession();
  const [status, setStatus] = useState<{ kind: "idle" | "success" | "error"; text: string }>({
    kind: "idle",
    text: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!email && session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [email, session]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setStatus({ kind: "idle", text: "" });

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          email: email.trim() || undefined,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Unable to send feedback.");
      }

      setStatus({ kind: "success", text: "Thanks for the feedback! We’ll review it shortly." });
      setMessage("");
    } catch (err: any) {
      setStatus({ kind: "error", text: err.message || "Unable to send feedback." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-brand-dark/5" />
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-brand-dark/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 py-16">
          <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center gap-6">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark text-white">
                  {type === "issue" ? <Bug className="h-6 w-6" /> : <Lightbulb className="h-6 w-6" />}
                </span>
                <span className="text-xl font-bold tracking-tight text-brand-dark">ReferralHub</span>
              </Link>

              <div className="space-y-4">
                <p className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Product feedback
                </p>
                <h1 className="text-4xl font-extrabold text-brand-dark md:text-5xl">
                  Help us build a better ReferralHub.
                </h1>
                <p className="text-lg text-brand-dark/70">
                  Share issues you’ve spotted or request new features. The team reviews every submission.
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm text-brand-dark/60">
                <Sparkles className="h-4 w-4 text-primary" />
                We respond faster when you include details and screenshots.
              </div>
            </div>

            <Card className="border-brand-dark/10 bg-white/90 shadow-2xl shadow-brand-dark/10 backdrop-blur">
              <CardContent className="p-8">
                <div className="mb-6 space-y-2">
                  <h2 className="text-2xl font-bold text-brand-dark">Send feedback</h2>
                  <p className="text-sm text-brand-dark/60">
                    Choose an option and tell us what’s on your mind.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-brand-dark/70">Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setType("issue")}
                        className={`flex h-11 items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition-all ${
                          type === "issue"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-brand-dark/10 text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark"
                        }`}
                      >
                        <Bug className="h-4 w-4" />
                        Report issue
                      </button>
                      <button
                        type="button"
                        onClick={() => setType("feature")}
                        className={`flex h-11 items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition-all ${
                          type === "feature"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-brand-dark/10 text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark"
                        }`}
                      >
                        <Lightbulb className="h-4 w-4" />
                        Request feature
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-brand-dark/70">Email (optional)</Label>
                    <Input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      placeholder="you@company.com"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-brand-dark/70">Message</Label>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      required
                      rows={4}
                      className="w-full rounded-xl border border-brand-dark/10 bg-white px-3 py-3 text-sm text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      placeholder={
                        type === "issue"
                          ? "Example: The referral request button on /browse shows an error after I click it."
                          : "Example: Add a way to save favorite listings and get alerts when they update."
                      }
                    />
                    <p className="text-xs text-brand-dark/50">
                      {type === "issue"
                        ? "Include the page, what you expected, and what happened."
                        : "Share the workflow and why this would help you."}
                    </p>
                  </div>

                  {status.kind !== "idle" && (
                    <div
                      className={`rounded-lg px-3 py-2 text-xs ${
                        status.kind === "success"
                          ? "bg-success-light text-success"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {status.text}
                    </div>
                  )}

                  <Button type="submit" disabled={sending} className="w-full font-semibold">
                    {sending ? "Sending..." : "Submit feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
