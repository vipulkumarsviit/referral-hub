"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Hexagon, Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Unable to send reset link");
      } else {
        setMessage(data.message || "If that email exists, a reset link has been sent.");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-brand-dark/5" />
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-brand-dark/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
          <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center gap-6">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark text-white">
                  <Hexagon className="h-6 w-6" />
                </span>
                <span className="text-xl font-bold tracking-tight text-brand-dark">ReferralHub</span>
              </Link>

              <div className="space-y-4">
                <p className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure access
                </p>
                <h1 className="text-4xl font-extrabold text-brand-dark md:text-5xl">Reset your password.</h1>
                <p className="text-lg text-brand-dark/70">
                  We’ll send a secure reset link to get you back into your account quickly.
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm text-brand-dark/60">
                <Sparkles className="h-4 w-4 text-primary" />
                Protect your account with a fresh password.
              </div>
            </div>

            <Card className="border-brand-dark/10 bg-white/90 shadow-2xl shadow-brand-dark/10 backdrop-blur">
              <CardContent className="p-8">
                <div className="mb-6 space-y-2">
                  <h2 className="text-2xl font-bold text-brand-dark">Email reset link</h2>
                  <p className="text-sm text-brand-dark/60">Enter your email and we’ll handle the rest.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      required
                      className="h-11"
                    />
                  </div>

                  {message && (
                    <div className="rounded-lg bg-success-light p-3 text-sm text-success">{message}</div>
                  )}
                  {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}

                  <Button type="submit" className="w-full font-bold" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Send reset link
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-brand-dark/60">
                  Remembered your password?{" "}
                  <Link href="/login" className="font-bold text-primary hover:underline">
                    Back to login
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
