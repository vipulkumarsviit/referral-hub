"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Hexagon, LogOut } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export function SiteHeader() {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    const dashboardHref =
        (session?.user as { role?: "seeker" | "referrer" | "admin" } | undefined)?.role === "admin"
            ? "/dashboard/admin"
            : "/dashboard";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-brand-dark/5 bg-parchment/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark text-white">
                        <Hexagon className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-brand-dark">
                        ReferralHub
                    </span>
                </Link>

                {/* Desktop Auth Buttons */}
                <div className="hidden items-center gap-3 sm:flex">
                    {session ? (
                        <>
                            <span className="text-sm font-medium mr-2">{session.user?.name || session.user?.email}</span>
                            <Button variant="ghost" className="font-bold text-brand-dark" onClick={() => signOut({ callbackUrl: "/" })}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="font-bold text-brand-dark">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button className="font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                                    Sign up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md text-brand-dark hover:bg-brand-dark/5 sm:hidden">
                        <Menu className="h-5 w-5" />
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72">
                        <nav className="mt-8 flex flex-col gap-4">
                            {session && (
                                <Link
                                    href={dashboardHref}
                                    onClick={() => setOpen(false)}
                                    className="text-base font-semibold text-brand-dark/70 transition-colors hover:text-primary"
                                >
                                    Dashboard
                                </Link>
                            )}
                            <hr className="my-4 border-brand-dark/5" />
                            {session ? (
                                <Button variant="ghost" className="justify-start font-bold" onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </Button>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setOpen(false)}>
                                        <Button variant="ghost" className="justify-start font-bold">
                                            Log in
                                        </Button>
                                    </Link>
                                    <Link href="/signup" onClick={() => setOpen(false)}>
                                        <Button className="font-bold">
                                            Sign up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
