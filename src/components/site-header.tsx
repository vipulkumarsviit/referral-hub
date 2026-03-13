"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Hexagon, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, UserCircle2 } from "lucide-react";

const navLinks = [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Browse", href: "/jobs" },
    { label: "About", href: "/about" },
];

export function SiteHeader() {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    type Profile = { name?: string; jobTitle?: string };
    const [profile, setProfile] = useState<Profile | null>(null);
    const dashboardHref =
        (session?.user as { role?: "user" | "admin" } | undefined)?.role === "admin"
            ? "/dashboard/admin"
            : "/dashboard";
    const displayName = profile?.name || session?.user?.name || "";
    const displayEmail = session?.user?.email || "";
    const initials = displayName
        ? displayName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((p: string) => p[0]?.toUpperCase())
            .join("")
        : "";

    useEffect(() => {
        let ignore = false;

        async function fetchProfile() {
            try {
                const res = await fetch("/api/user/profile");
                if (!ignore && res.ok) {
                    const data = await res.json();
                    setProfile(data.user as Profile);
                }
            } catch {
                // ignore
            }
        }

        if (session) {
            fetchProfile();
        }

        return () => {
            ignore = true;
        };
    }, [session]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-brand-dark/5 bg-parchment/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark text-white shadow-sm">
                        <Hexagon className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-brand-dark">
                        ReferralHub
                    </span>
                </Link>

                <nav className="hidden items-center gap-8 text-sm font-semibold text-brand-dark/70 md:flex">
                    {navLinks.map((link) => (
                        <Link key={link.label} href={link.href} className="transition-colors hover:text-primary">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 sm:flex">
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-3 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary">
                                <Avatar className="h-9 w-9 border border-brand-dark/10 bg-white">
                                    <AvatarFallback className="bg-brand-dark text-white">
                                        {initials || "RH"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-brand-dark/70">
                                    {displayName || displayEmail}
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[220px] rounded-2xl p-2">
                                <div className="space-y-1 px-3 py-2 text-sm text-brand-dark/55">
                                    <div className="grid grid-cols-[1rem_1fr] items-center gap-3 leading-none">
                                        <span className="flex h-4 w-4 items-center justify-center">
                                            <UserCircle2 className="h-4 w-4" />
                                        </span>
                                        <span className="truncate">{displayEmail || displayName || "Account"}</span>
                                    </div>
                                </div>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={() => (window.location.href = dashboardHref)}
                                    className="mx-1.5 grid grid-cols-[1rem_1fr_auto] items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium text-brand-dark"
                                >
                                    <span className="flex h-4 w-4 items-center justify-center">
                                        <LayoutDashboard className="h-4 w-4" />
                                    </span>
                                    <span>Dashboard</span>
                                    <span className="h-4 w-4" />
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    variant="destructive"
                                    className="mx-1.5 grid grid-cols-[1rem_1fr_auto] items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium"
                                >
                                    <span className="flex h-4 w-4 items-center justify-center">
                                        <LogOut className="h-4 w-4" />
                                    </span>
                                    <span>Log out</span>
                                    <span className="h-4 w-4" />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="outline" className="font-bold">
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

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md text-brand-dark hover:bg-brand-dark/5 sm:hidden">
                        <Menu className="h-5 w-5" />
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0">
                        <nav className="flex h-full flex-col gap-6 px-5 pb-8 pt-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="text-base font-semibold text-brand-dark/70 transition-colors hover:text-primary"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {session && (
                                <Link
                                    href={dashboardHref}
                                    onClick={() => setOpen(false)}
                                    className="text-base font-semibold text-brand-dark/70 transition-colors hover:text-primary"
                                >
                                    Dashboard
                                </Link>
                            )}
                            <hr className="border-brand-dark/5" />
                            {session ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 rounded-2xl border border-brand-dark/10 p-4">
                                        <Avatar className="h-9 w-9 border border-brand-dark/10 bg-white">
                                            <AvatarFallback className="bg-brand-dark text-white">
                                                {initials || "RH"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm font-semibold text-brand-dark/70">
                                            {displayName || displayEmail}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="justify-start font-bold"
                                        onClick={() => {
                                            setOpen(false);
                                            signOut({ callbackUrl: "/" });
                                        }}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link href="/login" onClick={() => setOpen(false)}>
                                            <Button variant="outline" className="w-full font-bold">
                                                Log in
                                            </Button>
                                        </Link>
                                        <Link href="/signup" onClick={() => setOpen(false)}>
                                            <Button className="w-full font-bold">Sign up</Button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
