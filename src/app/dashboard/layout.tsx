"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Hexagon,
    Home,
    List,
    Users,
    MessageSquare,
    Settings,
    LogOut,
    MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";

type NavRole = "seeker" | "referrer";

const navItems: {
    icon: typeof Home;
    label: string;
    href: string;
    roles: NavRole[];
}[] = [
    { icon: Home, label: "Home", href: "/dashboard", roles: ["seeker", "referrer"] },
    { icon: List, label: "My Listings", href: "/dashboard/listings", roles: ["referrer"] },
    { icon: Users, label: "Applicants", href: "/dashboard/applicants", roles: ["referrer"] },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages", roles: ["seeker", "referrer"] },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", roles: ["seeker", "referrer"] },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    type Profile = { name?: string; jobTitle?: string };
    const [profile, setProfile] = useState<Profile | null>(null);
    const router = useRouter();

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
            }
        }
        if (session) {
            fetchProfile();
        }
        return () => {
            ignore = true;
        };
    }, [session]);

    const displayName = profile?.name || session?.user?.name || "";
    const jobTitle = profile?.jobTitle || "";
    const role = (session?.user as any)?.role as "seeker" | "referrer" | undefined;
    const isReferrer = role === "referrer";
    const initials = displayName
        ? displayName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p: string) => p[0]?.toUpperCase())
              .join("")
        : "";

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r border-brand-dark/5 bg-white lg:flex">
                {/* Logo */}
                <div className="flex items-center gap-2 px-6 py-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-dark text-white">
                        <Hexagon className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-brand-dark">
                        Referrer.
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-1 px-3 pt-4">
                    {navItems.map((item) => {
                        if (!role || !item.roles.includes(role === "referrer" ? "referrer" : "seeker")) {
                            return null;
                        }
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-primary/10 font-bold text-primary"
                                        : "text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark"
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="border-t border-brand-dark/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                    {initials || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-bold text-brand-dark">{displayName || "—"}</p>
                                <p className="text-xs text-brand-dark/60">{jobTitle || "—"}</p>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-dark hover:bg-brand-dark/5"
                                aria-label="User menu"
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="end"
                                sideOffset={20}
                                alignOffset={0}
                                className="min-w-48 rounded-xl border border-brand-dark/10 bg-white p-1.5 shadow-xl"
                            >
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="px-2 py-1.5">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                                                    {initials || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="leading-tight">
                                                <div className="text-xs font-bold text-brand-dark">
                                                    {displayName || "—"}
                                                </div>
                                                <div className="text-[10px] text-brand-dark/60">
                                                    {jobTitle || "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => router.push("/dashboard/settings")}
                                    className="font-medium"
                                >
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    variant="destructive"
                                    className="font-medium"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile header */}
                <header className="flex items-center justify-between border-b border-brand-dark/5 bg-white px-6 py-4 lg:hidden">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-white">
                            <Hexagon className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-brand-dark">Referrer.</span>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="inline-flex">
                                <Avatar className="h-8 w-8 cursor-pointer">
                                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                        {initials || "?"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="bottom"
                            align="end"
                            sideOffset={8}
                            className="min-w-48 rounded-xl border border-brand-dark/10 bg-white p-1.5 shadow-xl"
                        >
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="px-2 py-1.5">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                                                {initials || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="leading-tight">
                                            <div className="text-xs font-bold text-brand-dark">
                                                {displayName || "—"}
                                            </div>
                                            <div className="text-[10px] text-brand-dark/60">
                                                {jobTitle || "—"}
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => router.push("/dashboard/settings")}
                                className="font-medium"
                            >
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: "/" })}
                                variant="destructive"
                                className="font-medium"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {children}
            </main>
        </div>
    );
}
