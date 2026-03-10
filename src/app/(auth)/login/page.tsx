"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Hexagon, LogIn, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid email or password");
                setLoading(false);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred");
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
                                    Trusted referrals
                                </p>
                                <h1 className="text-4xl font-extrabold text-brand-dark md:text-5xl">
                                    Welcome back.
                                </h1>
                                <p className="text-lg text-brand-dark/70">
                                    Pick up where you left off and keep your referral pipeline moving.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-brand-dark/60">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Access verified opportunities and messages in one place.
                            </div>
                        </div>

                        <Card className="border-brand-dark/10 bg-white/90 shadow-2xl shadow-brand-dark/10 backdrop-blur">
                            <CardContent className="p-8">
                                <div className="mb-6 space-y-2">
                                    <h2 className="text-2xl font-bold text-brand-dark">Sign in</h2>
                                    <p className="text-sm text-brand-dark/60">
                                        Enter your email and password to access your account.
                                    </p>
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
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    {error && (
                                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" className="h-11 w-full font-bold" disabled={loading}>
                                        {loading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <LogIn className="mr-2 h-4 w-4" />
                                        )}
                                        Sign In
                                    </Button>
                                </form>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-brand-dark/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-brand-dark/40 font-bold">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                                        Google
                                    </Button>
                                    <Button variant="outline" type="button" onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}>
                                        LinkedIn
                                    </Button>
                                </div>

                                <p className="mt-6 text-center text-sm text-brand-dark/60">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/signup" className="font-bold text-primary hover:underline">
                                        Sign up
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
