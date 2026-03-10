"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Hexagon, UserPlus, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState<"seeker" | "referrer">("seeker");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name");
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            // Create user API route logic goes here in a real app
            // Assuming user creation API exists at /api/auth/register
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to register");
            }

            // Automatically sign in after creating account
            const signInRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (signInRes?.error) {
                setError("Account created but failed to log in");
                setLoading(false);
            } else {
                router.push("/onboarding");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <Link href="/" className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark text-white">
                        <Hexagon className="h-6 w-6" />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-brand-dark">Create an account</h1>
                    <p className="text-brand-dark/60">Join ReferralHub to find or refer talent</p>
                </div>

                <Card className="border-brand-dark/10 shadow-xl shadow-brand-dark/5">
                    <CardHeader>
                        <CardTitle>Sign up</CardTitle>
                        <CardDescription>Enter your details and select your path</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>I want to...</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRole("seeker")}
                                        className={`flex h-11 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all ${role === "seeker"
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-brand-dark/10 text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark"
                                            }`}
                                    >
                                        Find a job
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole("referrer")}
                                        className={`flex h-11 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all ${role === "referrer"
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-brand-dark/10 text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark"
                                            }`}
                                    >
                                        Refer someone
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    {role === "referrer" ? "Work email" : "Email address"}
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder={role === "referrer" ? "name@company.com" : "name@example.com"}
                                    required
                                    className="h-11"
                                />
                                {role === "referrer" && (
                                    <p className="text-xs text-brand-dark/40">You&apos;ll need to verify this email to get the Verified Badge.</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
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

                            <Button type="submit" className="w-full h-11 font-bold" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                Create account
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
                            <Button variant="outline" type="button" onClick={() => signIn("google")}>
                                Google
                            </Button>
                            <Button variant="outline" type="button" onClick={() => signIn("linkedin")}>
                                LinkedIn
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-brand-dark/5 p-4 py-6">
                        <p className="text-sm text-brand-dark/60">
                            Already have an account?{" "}
                            <Link href="/login" className="font-bold text-primary hover:underline">
                                Log in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
